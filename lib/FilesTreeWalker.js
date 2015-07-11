var file = require('file');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var events = require('./constants').events;

var Walker = assign({}, EventEmitter.prototype, {
  addListener: function (event, callback) {
    this.on(event, callback);
  },

  fireEvent: function(event, payload) {
    this.emit(event, payload);
  },

  scan: function (sourceDir, destDir) {
    var walker = this;

    file.walk(sourceDir, function (err, dirname, dirs, files) {
      if (err) {
        throw err;
      }
      //console.log('>> entering %s', dirname);
      // TODO if all files are the same type and can handled by same child_process, use one single child process
      files.forEach(function (file) {
        walker.fireEvent(events.foundFile, {file: file});
        //handler.handleFile(file, {}, resultCallback);
      })
    });
  }
});

module.exports = Walker;
