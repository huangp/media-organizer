import "babel-polyfill";

var moment = require('moment');

var Logger = require('graceful-logger').Logger;
var logger = new Logger();

//console.log(logger);

import {execSync} from 'child_process'

try {
  execSync('which foo')
} catch (err) {
  console.error('error executing foo', err.message)
}

