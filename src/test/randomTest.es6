import "babel-polyfill";

var moment = require('moment');

var Logger = require('graceful-logger').Logger;
var logger = new Logger();

//console.log(logger);


import {nextId, endClient, test} from '../lib/redis/uniqueId'

logger.debug('===== ')
nextId().then(endClient)