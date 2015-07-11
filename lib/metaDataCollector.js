











function onMetaDataForFile(eventPayload) {
  var file = eventPayload.file;
  var meta = eventPayload.meta;
  console.log('>>>> meta data: %s', file, JSON.stringify(meta, null, '  '));
}


exports.onMetaData = onMetaDataForFile;