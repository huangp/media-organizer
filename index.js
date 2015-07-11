var scanner = require('./lib/fileType');
var handler = require('./lib/fileHandler');
var file = require('file');


// TODO read source dir from command line option or some config file
var sourceDir = process.argv[2] || __dirname;
console.log('>> scanning %s', sourceDir);

function resultCallback(result) {
  console.info('>> result is: %s', JSON.stringify(result, null, '  '));
}

file.walk(sourceDir, function(err, dirname, dirs, files) {
  if (err) {
    throw err;
  }
  console.log('>> entering %s', dirname);
  // TODO if all files are the same type and can handled by same child_process, use one single child process
  files.forEach(function(file) {
    handler.handleFile(file, {}, resultCallback);
  })
});
