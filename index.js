var handler = require('./lib/fileHandler');
var metaDataCollector = require('./lib/metaDataCollector');
var events = require('./lib/constants').events;

var Walker = require('./lib/FilesTreeWalker');


// TODO read source dir from command line option or some config file
var sourceDir = process.argv[2] || __dirname;
console.log('>> scanning %s', sourceDir);

function resultCallback(result) {
  console.info('>> result is: %s', JSON.stringify(result, null, '  '));
}

Walker.addListener(events.foundFile, handler.handleFile);
Walker.addListener(events.fileMeta, metaDataCollector.onMetaData);

Walker.scan(sourceDir, 'dest');
