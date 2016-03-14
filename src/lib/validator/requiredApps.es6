// TODO validate required apps are installed and started
import esStore from '../elastic/MetaStore'
import log from '../logger'
import {execSync} from 'child_process'

function appOnPath (cmd) {
  try {
    // TODO this is OS specific
    execSync(`which ${cmd}`)
    return true
  } catch (err) {
    log.e('error finding ' + cmd, err.message)
    throw new Error(`${cmd} is not on PATH`)
  }
}

const mediainfoOnPath = () => {
  return appOnPath('mediainfo')
}
// elastic search
// redis server
// mediainfo
export function goodToGo () {
  return esStore.isAlive()
      .then(mediainfoOnPath, () => log.e('redis is alive'))
}




