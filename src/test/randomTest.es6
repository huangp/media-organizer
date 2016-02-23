import "babel-polyfill";

var moment = require('moment');

var Logger = require('graceful-logger').Logger;
var logger = new Logger();

//console.log(logger);

logger.warn('stuff', new Date());

function test() {
  var args = Array.prototype.slice.call(arguments);

  logger.info(args);
}

test('1', 2, new Date());

console.log(moment(1390622083660).format('YYYY-MM-DD HH:mm:ss Z'));

import settings from '../lib/elastic/indexSettings'

console.log(settings)