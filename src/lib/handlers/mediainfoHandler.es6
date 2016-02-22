import {spawn} from 'child_process'
import StreamSplitter from 'stream-splitter'
import moment from 'moment'

import {dateLooksReasonable, onErrorCallback} from '../util'
import log from '../logger'


export default function mediainfoHandler(file, meta, callback) {
  // TODO check mediainfo is installed on the system
  const mediainfo = spawn('mediainfo', ['--Inform=Video;%Encoded_Date%', file]);
  const splitter = mediainfo.stdout.pipe(StreamSplitter('\n'));
  splitter.encoding = 'utf8';

  splitter.on("token", function (token) {
    //console.log('mediainfo output: %s', token);
// UTC 2014-01-25 03:54:39
    if (!token) {
      return
    }
    const dateStr = token.slice(4) + ' +00:00'
    log.d('>>> media info encoded date string is:' + dateStr)
    const encodedDate = moment(dateStr, 'YYYY-MM-DD HH:mm:ss Z')
    if (dateLooksReasonable(encodedDate)) {
      //console.log('>> encoded date %s', encodedDate.format('MM-DD HH:mm:ss Z'));
      meta.encodedDate = encodedDate
    }

  });

  splitter.on("done", () => callback(meta));

  splitter.on("error", onErrorCallback);
}