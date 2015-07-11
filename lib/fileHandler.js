//var scanner = require('./fsScanner');
var fs = require('fs');
var path = require('path');
var util = require('util');
var child = require('child_process').spawn;
var StreamSplitter = require('stream-splitter');
var fileType = require('./fileType');
var moment = require('moment');
var shaFile = require('sha1-file');

var stdDateTimeFmt = 'YYYY-MM-DD HH:mm:ss';


function lsFullTimeHandler(file, meta, callback) {
  var ls = child('ls', ['--full-time', file]);
  var splitter = ls.stdout.pipe(StreamSplitter('\n'));
  splitter.encoding = 'utf8';

  splitter.on("token", function (token) {
    //console.log(">>>> ", token);
// -rwxrwxrwx. 1 pahuang pahuang 48523700 2013-08-22 16:45:10.000000000 +1000
    var lsOutput = token.split(' ');
    var size = lsOutput[4];
    var date = lsOutput[5];
    var time = lsOutput[6];
    var offset = fmtUTCOffset(lsOutput[7]);
    var dateStr = date + ' ' + time + '' + offset;
    //console.log('>>> date string is:' + dateStr);
    var timestamp = moment(dateStr);
    //console.log('>> timestamp %s', timestamp);
    meta.lsFullTime = timestamp.format(stdDateTimeFmt);
    meta.size = size;

    callback(meta);
  });

  splitter.on("done", function () {
    //console.log("And that's all folks!");
  });

  splitter.on("error", function (err) {
    // Any errors that occur on a source stream will be emitted on the
    // splitter Stream, if the source stream is piped into the splitter
    // Stream, and if the source stream doesn't have any other error
    // handlers registered.
    console.error("Oh noes!", err);
  });
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

function fileNameHandler(file, meta, callback) {
  var fileName = path.basename(file);
  // the file name convention I've used
  // 20140802
  var regex1 = /.*(\d{8}).+/;
  // 2014.03.28
  var regex2 = /.*(\d{4}\.\d{2}\.\d{2}).*/;
  // nexus phone file name convention: 20140821_132432
  var regex3 = /.*(\d{8}_\d{6}).*/;
  var result, fileNameDate;

  if (regex3.test(fileName)) {
    console.log('%s matches regex 3', fileName);
    result = regex3.exec(fileName);
    fileNameDate = moment(result[1], 'YYYYMMDD_HHmmss');
  } else if (regex2.test(fileName)) {
    console.log('%s matches regex 2', fileName);
    result = regex2.exec(fileName);
    fileNameDate = moment(result[1], 'YYYY.MM.DD');
  } else if (regex1.test(fileName)) {
    console.log('%s matches regex 1', fileName);
    result  = regex1.exec(fileName);
    fileNameDate = moment(result[1], 'YYYYMMDD');
  }
  console.log('>>> date embedded in file name is %s', result[1]);
  if (fileNameDate.isValid()) {
    meta.fileNameDate = fileNameDate.format(stdDateTimeFmt);
  }
  callback(meta);
}

function mediainfoHandler(file, meta, callback) {
  var mediainfo = child('mediainfo', ['--Inform="Video;%Encoded_Date%"', file]);
  var splitter = mediainfo.stdout.pipe(StreamSplitter('\n'));
  splitter.encoding = 'utf8';

  splitter.on("token", function (token) {
    //console.log(">>>> ", token);
// UTC 2014-01-25 03:54:39

    console.log('>>> date string is:' + token);
    var timestamp = moment(token);
    console.log('>> timestamp %s', timestamp);
    meta.encodedTime = timestamp.format(stdDateTimeFmt);
    //TODO use fs to read file size
    //meta.size = size;

    callback(meta);
  });

  splitter.on("done", function () {
    //console.log("And that's all folks!");
  });

  splitter.on("error", function (err) {
    // Any errors that occur on a source stream will be emitted on the
    // splitter Stream, if the source stream is piped into the splitter
    // Stream, and if the source stream doesn't have any other error
    // handlers registered.
    console.error("Oh noes!", err);
  });
}

function handleFile(file, meta, callback) {
  // TODO use RXjs to chain sha1file, lsFullTime, mediainfo encoded time all together
  meta = meta || {};
  meta.fileOrigin = file;
  meta.sha1sum = shaFile(file);

  var ext = fileType.ext(file);
  switch (ext) {
    case 'mov':
      lsFullTimeHandler(file, meta, callback);
      break;
    case 'mkv':
      fileNameHandler(file, meta, callback);
      break;
    case 'mp4':
      fileNameHandler(file, meta, mediainfoHandler.bind(null, file, meta, callback));
      break;
  }
}

exports.handleFile = handleFile;

function mp4Handler(file, callback) {


}

