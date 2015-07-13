
exports.events = {
  foundFile: 'foundFile',
  fileMeta: 'fileMeta'
};

exports.config = {
  sourceBase: '',
  destBase: '',
  // all dates should be after this date
  reasonableAfterDate: '2005-08-01',
  //stdDateFmt: 'YYYY-MM-DD HH:mm:ss',
  // date in file name is in this UTC offset
  utcOffset: '10:00',
  timezone: 'Australia/Brisbane',
  outputFileDateFmt: 'YYYY-MM-DD_HH-mm-ss'
};