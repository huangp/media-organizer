var file = require('file');
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

exports.fullPath = function (srcDir, fileName) {
  return path.join(srcDir, fileName);
};

function isMOV(file) {
  return ext(file) === 'mov';
}

exports.isMOV = isMOV;

exports.isMP4 = function (file) {
  return ext(file) === 'mp4';
};

exports.isJPG = function (file) {
  var extension = ext(file);
  return extension === 'jpg' || extension === 'jpeg';
};

exports.isAVI = function (file) {
  return ext(file) === 'avi';
};

exports.dirHasMOV = function (dir) {
  var files = fs.readdirSync(dir);
  // find is part of es6
  return files.find(isMOV);
};
