// TODO validate required apps are installed and started
import esStore from '../elastic/MetaStore'
import redisClient from '../redis/index'
import log from '../logger'
import {execSync} from 'child_process'

function appOnPath (cmd) {
  try {
    // TODO this is OS specific
    execSync(`which ${cmd}`)
    return true
  } catch (err) {
    log.e('error executing foo', err.message)
    throw new Error(cmd + ' is not on PATH')
  }
}

const mediainfoOnPath = () => {
  return appOnPath('mediainfo')
}
// elastic search
// redis server
// mediainfo
export function goodToGo () {
  return esStore.isAlive().then(redisClient.isAlive).then(mediainfoOnPath)
}




