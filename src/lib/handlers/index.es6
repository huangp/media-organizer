import shaFile from 'sha1-file'
import fs from 'fs'
import exifParser from 'exif-parser'

import {events} from '../constants'
import Walker from '../FilesTreeWalker'
import log from '../logger'

import {dateLooksReasonable, isRegularPhoto, isRawImage} from '../util'

import lsFullTimeHandler from './lsHandler'
import fileNameHandler from './fileNameHandler'
import mediainfoHandler from './mediainfoHandler'

import readExif from './exifHandler'
import {curry} from 'ramda'

const videoHandlers = [lsFullTimeHandler, fileNameHandler, mediainfoHandler];
const photoHandlers = [readExif, fileNameHandler, lsFullTimeHandler];

const totalVideoHandlers = videoHandlers.length;
const totalPhotoHandlers = photoHandlers.length;

const handlerCallback = (totalHandlerCount, file, meta) => {
  meta.handledCount += 1;
  if (meta.handledCount === totalHandlerCount) {
    Walker.fireEvent(events.fileMeta, {file: file, meta: meta});
  }
}

const doInSafeNet = (handlerFunc, file, meta, callback) => {
  try {
    handlerFunc(file, meta, callback)
  } catch (err) {
    log.e('err calling function', func, argsForFunc)
  }
}

export default function handleFile(eventPayload) {
  const file = eventPayload.file;
  // TODO use RXjs to chain sha1file, lsFullTime, mediainfo encoded time all together
  let meta = meta || {};
  meta.fileOrigin = file;
  meta.sha1sum = shaFile(file);
  meta.handledCount = 0;
  log.d('>> for file:', file);

  if (isRegularPhoto(file)) {
    photoHandlers.forEach((handlerFn) => {
      const curriedCallback = curry(handlerCallback)(totalPhotoHandlers, file);
      doInSafeNet(handlerFn, file, meta, curriedCallback)
    })
  } else if (isRawImage(file)) {
    doInSafeNet(lsFullTimeHandler, file, meta, curry(handlerCallback)(1, file))
  } else {
    videoHandlers.forEach((handlerFn) => {
      doInSafeNet(handlerFn, file, meta, curry(handlerCallback)(totalVideoHandlers, file))
    })
  }

}
