import {spawn} from 'child_process'
import StreamSplitter from 'stream-splitter'
import moment from 'moment'

import {onErrorCallback} from '../util'
import log from '../logger'

const fmtUTCOffset = (offset) => {
  if (!offset) {
    return ''
  }
  if (offset.length === 5) {
    return offset.substr(0, 3) + ':' + offset.slice(-2)
  } else if (offset.length === 4) {
    return offset.substr(0, 2) + ':' + offset.slice(-2)
  }
}

export default function lsFullTimeHandler(file, meta, callback) {
  const ls = spawn('ls', ['--full-time', file])
  const splitter = ls.stdout.pipe(StreamSplitter('\n'))
  splitter.encoding = 'utf8'

  splitter.on("token", function (token) {
    log.d(token);
// -rwxrwxrwx. 1 pahuang pahuang 48523700 2013-08-22 16:45:10.000000000 +1000
    var lsOutput = token.split(' ')
    var size = lsOutput[4]
    var date = lsOutput[5]
    var time = lsOutput[6]
    var offset = fmtUTCOffset(lsOutput[7])
    var dateStr = date + ' ' + time + '' + offset
    log.d('>>> ls --full-time date string is:' + dateStr)
    meta.lsFullTime = moment(dateStr)
    meta.size = size

    callback(meta)
  })

  splitter.on("done", () => {
    //console.log("And that's all folks!");
  })

  splitter.on("error", onErrorCallback)
}