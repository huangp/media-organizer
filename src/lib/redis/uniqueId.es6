import redis from 'redis'
import log from '../logger'
import {getClient, endClient, doInPromise} from './getClient'

const nextIdKey = 'id:next'


export function nextId () {
  return doInPromise('setnx', nextIdKey, 0)
      .then(() => {
        return doInPromise('incr', nextIdKey)
      })
      .then(reply => {
        log.d('get next id:' + reply.payload)
        endClient()
        return reply.payload
      })
      .catch(err => {
        log.e('error calling redis')
        console.error(err)
      })
}
