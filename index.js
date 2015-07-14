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
var destDir = process.argv[3] || path.join(os.tmpDir(), 'media-organizer');

config.sourceBase = sourceDir;
config.destBase = destDir;

log.d('>> scanning:', config.sourceBase);

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir);
}

Walker.addListener(events.foundFile, handler.handleFile);
Walker.addListener(events.fileMeta, metaDataCollector.onMetaData);

Walker.scan(config.sourceBase);
