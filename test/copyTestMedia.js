require("babel-register");
var path = require('path');
var os = require('os');
var child = require('child_process').spawn;
var checkError = require('../lib/util').checkError;

var fs = require('fs-extra');

var original = path.join(__dirname, '../test_media');
var copyTo = path.join(os.tmpDir(), 'test_media');

fs.emptyDir(copyTo, function(err) {
  checkError(err);
  // copy original test medias to tmp folder
  fs.copy(original, copyTo, {clobber: true}, function(err) {
    checkError(err);
    console.log('%s copied to %s', original, copyTo);
    find(copyTo);

    // empty default moved to destination
    var testMovedDest = path.join(os.tmpDir(), 'media-organizer');
    fs.emptyDir(testMovedDest, function(err) {
      checkError(err);
      console.log('%s emptied', testMovedDest);
      find(testMovedDest);
    });
  });
});


function find(dest) {
  console.log();

  var find = child('find', [dest, '-type', 'f']);
  find.stdout.setEncoding('utf8');
  find.stderr.setEncoding('utf8');
  find.stdout.on('data', console.log);
  find.stderr.on('data', console.log);
  find.on('close', function(code) {
    console.log('exit with code %d', code);
  });
}

var elasticsearch = require('elasticsearch');
var config = require('../lib/constants').config;

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  //sniffOnStart: true,
  //sniffInterval: 60000,
  keepAlive: false, //
  apiVersion: '1.6'
});

client.indices.delete({index: config.indexName, ignore: 404}, function(err, response) {
  checkError(err);
  console.log('index deleted:%s', response.body);
});
