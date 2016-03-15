import path from 'path'
import fs from 'fs-extra'

import {isVideo, earliestDate} from './util'
import {config} from './constants'
import log from './logger'
import store from './elastic/MetaStore'
// this is needed to have moment-timezone support;
require('moment-timezone');

const destination = (file, createdDate) => {
  if (config.destBase) {
    const destRoot = config.destBase;
    const localDate = createdDate.tz(config.timezone).format('YYYY-MM');
    const subFolder = isVideo(file) ? 'video' : 'photo';
    return path.join(destRoot, localDate, subFolder);
  } else {
    return path.dirname(file);
  }

}

const moveFile = (file, shouldMoveTo) => {
  return new Promise(function (resolve, reject) {
    fs.move(file, shouldMoveTo, {clobber: true}, (err) => {
      if (err) {
        log.e('something wrong with move file:' + file + '->' + shouldMoveTo)
        console.log(err.stack);
        reject(err)
      } else {
        log.i(file, ' -> ', shouldMoveTo)
        resolve()
      }
    });
  });
}

export default function onMetaDataForFile (eventPayload) {
  const file = eventPayload.file
  const meta = eventPayload.meta

  meta.createdDate = meta.createdDate || earliestDate(meta.lsFullTime, meta.fileNameDate, meta.encodedDate, meta.modifiedDate);

  if (!meta.createdDate) {
    log.w('>> Can not work out created date of %s', file);
    log.w('>> meta data:', meta)
    return
  }

  const unixOffset = meta.createdDate.valueOf()

  log.d('>>>> meta data:', file, meta)

  const destFolder = destination(file, meta.createdDate);
  const createdDateStr = meta.createdDate.format(config.outputFileDateFmt);
  // use a created date unix offset + printed date as file name (the sha is also calculated from the created date)
  const shouldMoveTo = path.join(destFolder, unixOffset + '_' + createdDateStr + path.extname(file));

  const finalFile = config.destBase ? shouldMoveTo : file
  if (config.destBase) {
    moveFile(file, finalFile)
  }
  // TODO should check if the file has already been indexed
  store.index(finalFile, meta);
}
