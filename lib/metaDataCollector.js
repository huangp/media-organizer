var util = require('./util');
var checkError = util.checkError;
var config = require('./constants').config;
var path = require('path');
var fs = require('fs-extra');
var shasum = require('shasum');
var log = require('./logger');
var Promise = require('es6-promises');
var Thumbnail = require('thumbnail');
var store = require('./MetaStore');
// this is needed to have moment-timezone support;
require('moment-timezone');

var fileMetas = {};

function destination(file, createdDate) {
  var localDate;
  var destRoot;
  var subFolder;
  if (config.destBase) {
    destRoot = config.destBase;
    localDate = createdDate.tz(config.timezone).format('YYYY-MM');
    subFolder = util.isVideo(file) ? 'video' : 'photo';
    return path.join(destRoot, localDate, subFolder);
  } else {
    return path.dirname(file);
  }

}

function onMetaDataForFile(eventPayload) {
  var file = eventPayload.file;
  var meta = eventPayload.meta;

  meta.createdDate = meta.createdDate || util.earliestDate(meta.lsFullTime, meta.fileNameDate, meta.encodedDate, meta.modifiedDate);

  if (!meta.createdDate) {
    log.w('>> Can not work out created date of %s', file);
    log.w('>> meta data:', meta);
    return;
  }

  var unixOffset = meta.createdDate.valueOf();
  meta.id = shasum('unix offset:' + unixOffset);

  log.d('>>>> meta data:', file, meta);

  var destFolder = destination(file, meta.createdDate);
  var createdDateStr = meta.createdDate.format(config.outputFileDateFmt);
  // use a created date unix offset + printed date as file name (the sha is also calculated from the created date)
  var shouldMoveTo = path.join(destFolder, unixOffset + '_' + createdDateStr + path.extname(file));

  var dirsToMake = util.isPhoto(file) ? path.join(destFolder, 'tn') : destFolder;

  var mkdirPromise = new Promise(function(resolve, reject) {
    fs.mkdirs(dirsToMake, function(err) {
      if (err) {
        log.e('something wrong with making dirs:' + err.stack);
        reject(err);
      } else {
        resolve(shouldMoveTo);
      }
    });
  });


  if (config.destBase) {
    mkdirPromise
        .then(moveFile.bind(this, file))
        .then(createThumbnail.bind(this, destFolder, shouldMoveTo))
        .catch(util.promiseCatch);
    store.index(shouldMoveTo, meta);
  } else {
    mkdirPromise.then(createThumbnail.bind(this, destFolder, file)).catch(util.promiseCatch);
    store.index(file, meta);
  }
}

function moveFile(file, shouldMoveTo) {
  return new Promise(function (resolve, reject) {
    // TODO fs-extra.move seems to be able to create dirs as well
    fs.move(file, shouldMoveTo, {clobber: true}, function (err) {
      if (err) {
        log.e('something wrong with move file:' + file + '->' + shouldMoveTo);
        console.log(err.stack);
        reject(err);
      } else {
        log.i(file, ' -> ', shouldMoveTo);
        resolve();
      }
    });
  });
}

function createThumbnail(destFolder, finalFileName) {
  if (util.isPhoto(finalFileName)) {
    var thumbnail = new Thumbnail(destFolder, path.join(destFolder, 'tn'));
    thumbnail.ensureThumbnail(path.basename(finalFileName), 120, null, function (err, filename) {
      // "filename" is the name of the thumb in '/path/to/thumbnails'
      // TODO thumbnail name has width suffix at the end
      checkError(err);
      log.i('thumbnail written to ' + filename);
    });
  }
}


exports.onMetaData = onMetaDataForFile;