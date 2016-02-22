var util = require('./util');
var config = require('./constants').config;
var path = require('path');
var fs = require('fs-extra');
var log = require('./logger');
var store = require('./MetaStore');
// this is needed to have moment-timezone support;
require('moment-timezone');


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

  log.d('>>>> meta data:', file, meta);

  var destFolder = destination(file, meta.createdDate);
  var createdDateStr = meta.createdDate.format(config.outputFileDateFmt);
  // use a created date unix offset + printed date as file name (the sha is also calculated from the created date)
  var shouldMoveTo = path.join(destFolder, unixOffset + '_' + createdDateStr + path.extname(file));

  //var mkdirPromise = new Promise(function(resolve, reject) {
  //  fs.mkdirs(destFolder, function(err) {
  //    if (err) {
  //      log.e('something wrong with making dirs:', err);
  //      reject(err);
  //    } else {
  //      resolve(shouldMoveTo);
  //    }
  //  });
  //});

  const finalFile = config.destBase ? shouldMoveTo : file
  if (config.destBase) {
    moveFile(file, finalFile)
  }
  store.index(finalFile, meta);
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

exports.onMetaData = onMetaDataForFile;