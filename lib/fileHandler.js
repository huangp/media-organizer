var path = require('path');
var child = require('child_process').spawn;
var StreamSplitter = require('stream-splitter');
var moment = require('moment');
var shaFile = require('sha1-file');
var Walker = require('./FilesTreeWalker');
var fs = require('fs');
var exifParser = require('exif-parser');

var events = require('./constants').events;
var config = require('./constants').config;
var util = require('./util');
var log = require('./logger');

var videoHandlers = [];
var photoHandlers = [];

function lsFullTimeHandler(file, meta, callback) {
  var ls = child('ls', ['--full-time', file]);
  var splitter = ls.stdout.pipe(StreamSplitter('\n'));
  splitter.encoding = 'utf8';

  splitter.on("token", function (token) {
    log.d(token);
// -rwxrwxrwx. 1 pahuang pahuang 48523700 2013-08-22 16:45:10.000000000 +1000
    var lsOutput = token.split(' ');
    var size = lsOutput[4];
    var date = lsOutput[5];
    var time = lsOutput[6];
    var offset = fmtUTCOffset(lsOutput[7]);
    var dateStr = date + ' ' + time + '' + offset;
    log.d('>>> ls --full-time date string is:' + dateStr);
    meta.lsFullTime = moment(dateStr);
    meta.size = size;

    callback(meta);
  });

  splitter.on("done", function () {
    //console.log("And that's all folks!");
  });

  splitter.on("error", util.onErrorCallback);
}

function fmtUTCOffset(offset) {
  if (!offset) {
    return '';
  }
  if (offset.length === 5) {
    return offset.substr(0, 3) + ':' + offset.slice(-2);
  } else if (offset.length === 4) {
    return offset.substr(0, 2) + ':' + offset.slice(-2);
  }
}

function dateLooksReasonable(momentDate) {
  return momentDate && momentDate.isValid() && momentDate.isAfter(config.reasonableAfterDate);
}

function fileNameHandler(file, meta, callback) {
  var fileName = path.basename(file);
  // the file name convention I've used
  // 20140802
  var regex1 = /.*(\d{8}).+/;
  // 2014.03.28
  var regex2 = /.*(\d{4}\.\d{2}\.\d{2}).*/;
  // nexus phone file name convention: 20140821_132432
  var regex3 = /.*(\d{8}_\d{6}).*/;
  var unixMilliRegex = /\w*(\d{13})\.*/;

  var result, dateInFileName;

  // TODO figure out a better way to structure this. regex3 takes precedence over regex 1 because 1 is part of 3
  if (unixMilliRegex.test(fileName)) {
    result = unixMilliRegex.exec(file);
    dateInFileName = moment(parseInt(result[1]));
  } else if (regex3.test(fileName)) {
    result = regex3.exec(fileName);
    dateInFileName = moment(result[1] + ' +10:00', 'YYYYMMDD_HHmmss Z');
  } else if (regex2.test(fileName)) {
    result = regex2.exec(fileName);
    dateInFileName = moment(result[1] + ' +10:00', 'YYYY.MM.DD Z');
  } else if (regex1.test(fileName)) {
    result  = regex1.exec(fileName);
    dateInFileName = moment(result[1] + ' +10:00', 'YYYYMMDD Z');
  }
  if (dateLooksReasonable(dateInFileName)) {
    log.d('>>> date in file name is %s', dateInFileName.format('MM-DD HH:mm:ss Z'));
    meta.fileNameDate = dateInFileName;
  }
  callback(meta);
}

function mediainfoHandler(file, meta, callback) {
  var splitter;
  var mediainfo;

  mediainfo = child('mediainfo', ['--Inform=Video;%Encoded_Date%', file]);
  splitter = mediainfo.stdout.pipe(StreamSplitter('\n'));
  splitter.encoding = 'utf8';

  splitter.on("token", function (token) {
    //console.log('mediainfo output: %s', token);
// UTC 2014-01-25 03:54:39
    if (!token) {
      return;
    }
    var dateStr = token.slice(4) + ' +00:00';
    log.d('>>> media info encoded date string is:' + dateStr);
    var encodedDate = moment(dateStr, 'YYYY-MM-DD HH:mm:ss Z');
    if (dateLooksReasonable(encodedDate)) {
      //console.log('>> encoded date %s', encodedDate.format('MM-DD HH:mm:ss Z'));
      meta.encodedDate = encodedDate;
    }

  });

  splitter.on("done", function () {
    callback(meta);
  });

  splitter.on("error", util.onErrorCallback);
}

/**
 * Read photo EXIF information
 * @param file
 * @param meta
 * @param callback
 */
function readExif(file, meta, callback) {
  var readableStream = fs.createReadStream(file, {start: 0, end: 65635});

  readableStream.on('readable', function() {
    var chunk = readableStream.read(65535),
        result;
    if (!meta.exif && null !== chunk) {
      log.d('=== reading EXIF from file: %s', file);
      var parser = exifParser.create(chunk);
      result = parser.parse();
      meta.exif = result.tags;
      if (result.tags.CreateDate) {
        meta.createdDate = moment.unix(result.tags.CreateDate);
      } else if (result.tags.ModifyDate) {
        meta.modifiedDate = moment(result.tags.ModifyDate, 'YYYY:MM:DD HH:mm:ss')
      }
      if (result.hasThumbnail('image/jpeg')) {
        log.d(file + ' has thumbnail');
        meta.thumbnailBuffer = result.getThumbnailBuffer();
      }

      //console.log('>> image size: %s', result.getImageSize());
      log.d('>>> image exif tags:', JSON.stringify(result.tags, null, '  '));
      callback(meta);
    }
  });
}


videoHandlers.push(lsFullTimeHandler);
videoHandlers.push(fileNameHandler);
videoHandlers.push(mediainfoHandler);

var totalVideoHandlers = videoHandlers.length;

photoHandlers.push(readExif);
photoHandlers.push(fileNameHandler);

var totalPhotoHandlers = photoHandlers.length;

function handlerCallback(totalHandlerCount, file, meta) {
  meta.handledCount += 1;
  if (meta.handledCount === totalHandlerCount) {
    Walker.fireEvent(events.fileMeta, {file: file, meta: meta});
  }
}

function handleFile(eventPayload) {
  var file = eventPayload.file;
  // TODO use RXjs to chain sha1file, lsFullTime, mediainfo encoded time all together
  var meta = meta || {};
  meta.fileOrigin = file;
  meta.sha1sum = shaFile(file);
  meta.handledCount = 0;
  log.d('>> for file:', file);

  if (util.isPhoto(file)) {
    photoHandlers.forEach(function(handlerFn) {
      handlerFn(file, meta, handlerCallback.bind(this, totalPhotoHandlers, file));
    });
  } else {
    videoHandlers.forEach(function(handlerFn) {
      handlerFn(file, meta, handlerCallback.bind(this, totalVideoHandlers, file));
    });
  }


}

exports.handleFile = handleFile;

