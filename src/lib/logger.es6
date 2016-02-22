var Logger = require('graceful-logger').Logger;
var log = new Logger({debug: 1});

var levelEnum = {
  'debug': 1, 'info': 2, 'warn': 3, 'error': 4
};
var appRootDir = require('app-root-dir').get();
var logLevel = require(appRootDir + '/config.json').logLevel || levelEnum.debug;

function toNumber(level) {
  return levelEnum[level] || 0;
}

exports.d = function() {
  if (toNumber(logLevel) <= levelEnum.debug) {
    var args = [...arguments];

    log.debug(args);
  }
};

exports.i = function() {
  if (toNumber(logLevel) <= levelEnum.info) {
    var args = [...arguments];

    log.info(args);
  }
};

exports.w = function() {
  if (toNumber(logLevel) <= levelEnum.warn) {
    var args = [...arguments];

    log.warn(args);
  }
};

exports.e = function() {
  if (toNumber(logLevel) <= levelEnum.error) {
    var args = [...arguments];

    log.error(args);
  }
};


