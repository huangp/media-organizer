var os = require('os');
var path = require('path');
var fs =require('fs');
var handler = require('./lib/fileHandler');
var metaDataCollector = require('./lib/metaDataCollector');
var constants = require('./lib/constants');
var events = constants.events;
var config = constants.config;
var log = require('./lib/logger');

var Walker = require('./lib/FilesTreeWalker');

// TODO read source dir from command line option or some config file
var sourceDir = process.argv[2] || __dirname;
var destDir = (process.argv.length > 3 && process.argv[3]) || '';

config.sourceBase = sourceDir;
config.destBase = destDir;

log.i(config);

log.d('>> scanning:', config.sourceBase);

Walker.addListener(events.foundFile, handler.handleFile);
Walker.addListener(events.fileMeta, metaDataCollector.onMetaData);

Walker.scan(config.sourceBase);
