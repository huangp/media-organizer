import path from 'path'
import moment from 'moment'

import {config} from '../constants'
import {dateLooksReasonable} from '../util'
import log from '../logger'

export default function fileNameHandler(file, meta, callback) {
  var fileName = path.basename(file);
  // the file name convention I've used
  // 20140802
  var regex1 = /.*(\d{8}).+/;
  // 2014.03.28
  var regex2 = /.*(\d{4}\.\d{2}\.\d{2}).*/;
  // nexus phone file name convention: 20140821_132432
  var regex3 = /.*(\d{8}_\d{6}).*/;
  var unixMilliRegex = /\w*(\d{13})\.*/;

  var result, dateInFileName;

  // TODO figure out a better way to structure this. regex3 takes precedence over regex 1 because 1 is part of 3
  if (unixMilliRegex.test(fileName)) {
    result = unixMilliRegex.exec(file);
    dateInFileName = moment(parseInt(result[1]));
  } else if (regex3.test(fileName)) {
    result = regex3.exec(fileName);
    dateInFileName = moment(result[1] + ' +10:00', 'YYYYMMDD_HHmmss Z');
  } else if (regex2.test(fileName)) {
    result = regex2.exec(fileName);
    dateInFileName = moment(result[1] + ' +10:00', 'YYYY.MM.DD Z');
  } else if (regex1.test(fileName)) {
    result  = regex1.exec(fileName);
    dateInFileName = moment(result[1] + ' +10:00', 'YYYYMMDD Z');
  }
  if (dateLooksReasonable(dateInFileName)) {
    log.d('>>> date in file name is %s', dateInFileName.format('MM-DD HH:mm:ss Z'));
    meta.fileNameDate = dateInFileName;
  }
  callback(meta);
}