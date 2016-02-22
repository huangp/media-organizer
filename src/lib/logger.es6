import {Logger} from 'graceful-logger'
const log = new Logger({debug: 1})

const levelEnum = {
  'debug': 1, 'info': 2, 'warn': 3, 'error': 4
}
const appRootDir = require('app-root-dir').get();
const logLevel = require(appRootDir + '/config.json').logLevel || levelEnum.debug

const toNumber = (level) => {
  return levelEnum[level] || 0
}

export function d () {
  if (toNumber(logLevel) <= levelEnum.debug) {
    const args = [...arguments]

    log.debug(args)
  }
}

export function i () {
  if (toNumber(logLevel) <= levelEnum.info) {
    const args = [...arguments]

    log.info(args)
  }
}

export function w () {
  if (toNumber(logLevel) <= levelEnum.warn) {
    const args = [...arguments]

    log.warn(args)
  }
}

export function e () {
  if (toNumber(logLevel) <= levelEnum.error) {
    const args = [...arguments]

    log.error(args)
  }
}

export default {
  d,
  i,
  w,
  e
}

