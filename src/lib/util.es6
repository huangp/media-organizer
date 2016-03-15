import path from 'path'
import extName from 'ext-name'
import log from './logger'
import {config} from './constants'

export function ext(file) {
  // extName can not resolve some of the files. e.g. PNG and MOV
  const extObj = extName(file.toLowerCase());
  let ext;
  if (extObj) {
    ext = extObj.ext;
  } else {
    ext = path.extname(file.toLowerCase()).slice(1);
  }
  //console.log('>>>> for %s ext is %s', file, ext.toLowerCase());
  return ext.toLowerCase();
}

const videoExts = ['mp4', 'avi', 'mkv', 'mov']
const photoExts = ['jpg', 'jpeg', 'dng']

export function isVideo (file) {
  return videoExts.indexOf(ext(file)) >= 0
}

export function isPhoto (file) {
  return photoExts.indexOf(ext(file)) >= 0
}

export function isRegularPhoto (file) {
  return !isRawImage(file) && isPhoto(file)
}

export function isRawImage (file) {
  return ext(file) === 'dng'
}

export function fullPath (srcDir, fileName) {
  return path.join(srcDir, fileName)
}

export function earliestDate () {
  var dates = [...arguments]
  if (dates && dates.length > 0) {
    return dates
        .reduce((previous, current) => {
          return previous && previous.isBefore(current) ? previous : current
        })
  }
  return null
}

export function fileName (file) {
  return path.basename(file)
}


export function onErrorCallback (err) {
  // TODO log to a file. This is used by lsHandler and mediainfoHandler. Should just ignore it? abort the file move?
  if (err) {
    log.e('Error:', err)
    throw err
  }
}

export function checkError (err) {
  if (err) {
    log.e('Error:', err)
    throw err
  }
}

export function promiseCatch (err) {
  log.e('something wrong:' + err)
  console.error(err.stack)
}

export function dateLooksReasonable(momentDate) {
  return momentDate && momentDate.isValid() && momentDate.isAfter(config.reasonableAfterDate);
}