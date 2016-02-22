const appRootDir = require('app-root-dir').get();
const globalConfig = require(appRootDir + '/config.json');

export const events = {
  foundFile: 'foundFile',
  fileMeta: 'fileMeta'
}


export const config = {
  sourceBase: '',
  destBase: '',
  // all dates should be after this date
  reasonableAfterDate: globalConfig.reasonableAfterDate,
  //stdDateFmt: 'YYYY-MM-DD HH:mm:ss',
  // date in file name is in this UTC offset
  utcOffset: globalConfig.utcOffset,
  timezone: globalConfig.timezone,
  outputFileDateFmt: globalConfig.outputFileDateFmt,
  indexName: globalConfig.indexName
}