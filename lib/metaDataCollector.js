var util = require('./util');


var fileMetas = {};

function onMetaDataForFile(eventPayload) {
  var file = eventPayload.file;
  var meta = eventPayload.meta;

  meta.bestDate = util.earliestDate(meta.lsFullTime, meta.fileNameDate, meta.encodedDate);
  console.log('>>>> meta data: %s', file, JSON.stringify(meta, null, '  '));

}


exports.onMetaData = onMetaDataForFile;