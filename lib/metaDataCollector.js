var util = require('./util');
var checkError = util.checkError;
var config = require('./constants').config;
var path = require('path');
var fs = require('fs-extra');
var shasum = require('shasum');
var log = require('./logger');
var Promise = require('es6-promises');
var Thumbnail = require('thumbnail');
// this is needed to have moment-timezone support;
require('moment-timezone');

var fileMetas = {};



function destination(file, createdDate) {
  var destRoot = config.destBase;
  var localDate = createdDate.tz(config.timezone).format('YYYY-MM');
  var subFolder;
  if (util.isVideo(file)) {
    subFolder = 'video';
  } else {
    subFolder = 'photo';
  }
  return path.join(destRoot, localDate, subFolder);
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
  var destFolder = destination(file, meta.createdDate);
  var createdDateStr = meta.createdDate.format(config.outputFileDateFmt);
  var unixOffset = meta.createdDate.valueOf();
  meta.id = shasum('unix offset:' + unixOffset);
  // use a created date unix offset + printed date as file name (the sha is also calculated from the created date)
  meta.shouldMoveTo = path.join(destFolder, unixOffset + '_' + createdDateStr + path.extname(file));
  log.d('>>>> meta data:', file, meta);

  var dirsToMake = util.isPhoto(file) ? path.join(destFolder, 'tn') : destFolder;

  var mkdirPromise = new Promise(function(resolve, reject) {
    fs.mkdirs(dirsToMake, function(err) {
      if (err) {
        log.e('something wrong:' + err.stack);
        reject(err);
      } else {
        resolve(meta.shouldMoveTo);
      }
    });
  });

  mkdirPromise.then(function(shouldMoveTo) {
    return new Promise(function (resolve, reject) {
      fs.rename(file, shouldMoveTo, function (err) {
        if (err) {
          log.e('something wrong:' + err.stack);
          reject(err);
        } else {
          log.i(file, ' -> ', shouldMoveTo);
          resolve(util.isPhoto(file));
        }
      });
    });
  }).then(function (isPhoto) {
    if (isPhoto) {
      var thumbnail = new Thumbnail(destFolder, path.join(destFolder, 'tn'));
      log.d('handling tn for file:' + file);
      thumbnail.ensureThumbnail(path.basename(meta.shouldMoveTo), 120, null, function (err, filename) {
        // "filename" is the name of the thumb in '/path/to/thumbnails'
        // TODO thumbnail name has width suffix at the end
        checkError(err);
        log.i('thumbnail written to ' + filename);
      });
    }
  }).catch(function(err) {
    log.e('something wrong:' + err.stack);
  });
}


exports.onMetaData = onMetaDataForFile;