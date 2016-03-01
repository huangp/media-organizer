import {nextId} from './uniqueId'
import {getClient, endClient, doInPromise} from './getClient'
import log from '../logger'

function isAlive () {
  return doInPromise('get', 'foo').then(res => {
    // as long as we get back result we are fine
    return {}
  }).catch((err) => {
    log.e('redis server is not running', err)
    throw new Error('redis server is not running')
  })
}

export default {
  nextId,
  endClient,
  isAlive
}