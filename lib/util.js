var path = require('path');
var extName = require('ext-name');
var fs = require('fs');

function ext(file) {
  // extName can not resolve some of the files. e.g. PNG and MOV
  var extObj = extName(file.toLowerCase());
  var ext;
  if (extObj) {
    ext = extObj.ext;
  } else {
    ext = path.extname(file.toLowerCase()).slice(1);
  }
  //console.log('>>>> for %s ext is %s', file, ext.toLowerCase());
  return ext.toLowerCase();
}

exports.ext = ext;

var videoExts = ['mp4', 'avi', 'mkv', 'mov'];
var photoExts = ['jpg', 'jpeg', 'dng'];

exports.isVideo = function(file) {
  return videoExts.indexOf(ext(file)) >= 0;
};

exports.isPhoto = function(file) {
  return photoExts.indexOf(ext(file)) >= 0;
};

exports.fullPath = function (srcDir, fileName) {
  return path.join(srcDir, fileName);
};

exports.earliestDate = function () {
  var dates = Array.prototype.slice.call(arguments);
  return dates
      .filter(function (date) {
        return date;
      })
      .reduce(function (previous, current) {
        if (previous && previous.isBefore(current)) {
          return previous;
        } else {
          return current;
        }
      })
};


exports.onErrorCallback = function(err) {
  if (err) {
    console.error('Error:' + err);
    throw err;
  }
};