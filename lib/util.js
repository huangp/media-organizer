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


