var util = require('./util');
var checkError = util.checkError;
var config = require('./constants').config;
var path = require('path');
var fs = require('fs-extra');
var shasum = require('shasum');
// this is needed to have moment-timezone support;
require('moment-timezone');

var fileMetas = {};



function destination(createdDate) {
  var destRoot = config.destBase;
  var localDate = createdDate.tz(config.timezone).format('YYYY-MM');
  return path.join(destRoot, localDate);
}

function onMetaDataForFile(eventPayload) {
  var file = eventPayload.file;
  var meta = eventPayload.meta;

  meta.createdDate = meta.createdDate || util.earliestDate(meta.lsFullTime, meta.fileNameDate, meta.encodedDate, meta.modifiedDate);

  if (!meta.createdDate) {
    console.warn('>> Can not work out created date of %s', file);
    console.log('>>>> meta data: %s', file, JSON.stringify(meta, null, '  '));
    return;
  }
  var destFolder = destination(meta.createdDate);
  var createdDateStr = meta.createdDate.format(config.outputFileDateFmt);
  var unixOffset = meta.createdDate.valueOf();
  meta.id = shasum('unix offset:' + unixOffset);
  // use a created date unix offset + printed date as file name (the sha is also calculated from the created date)
  meta.shouldMoveTo = path.join(destFolder, unixOffset + '_' + createdDateStr + path.extname(file));
  console.log('>>>> meta data: %s', file, JSON.stringify(meta, null, '  '));

  fs.mkdirs(destFolder, function(err) {
    checkError(err);
    fs.rename(file, meta.shouldMoveTo, function(err) {
      checkError(err);
      console.log('>> %s -> %s', file, meta.shouldMoveTo);
    });
  })

}


exports.onMetaData = onMetaDataForFile;