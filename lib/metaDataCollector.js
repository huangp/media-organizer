var util = require('./util');
var checkError = util.checkError;
var config = require('./constants').config;
var path = require('path');
var fs = require('fs-extra');
var shasum = require('shasum');
var log = require('./logger');
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
  var thumbnailBuffer = meta.thumbnailBuffer;
  delete meta.thumbnailBuffer;

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

  fs.mkdirs(destFolder, function(err) {
    checkError(err);
    fs.rename(file, meta.shouldMoveTo, function(err) {
      checkError(err);
      log.i(file, ' -> ', meta.shouldMoveTo);
    });
  });

  if (thumbnailBuffer) {
    // prefix final file name with tn_
    var thumbnailFile = path.join(destFolder, 'tn_' + path.basename(meta.shouldMoveTo));
    fs.writeFile(thumbnailFile, thumbnailBuffer, function(err) {
      util.checkError(err);
      log.d('thumbnail written to ' + thumbnailFile);
    });
  }

}


exports.onMetaData = onMetaDataForFile;