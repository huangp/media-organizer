import redis from 'redis'
import log from '../logger'

let client

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

export const REDIS_PORT = 6379

export const getClient = () => {
  if (!client) {
    client = redis.createClient({port: REDIS_PORT})
    client.on('error', (err) => {
      log.e("Error connecting to redis:" + err);
      throw new Error(err)
    })
    client.on('end', () => {
      log.d('Redis connection ended')
    })
  }

  return client;
}

export function endClient () {
  log.d('quiting redis client')
  getClient().quit()
  client = null
}

/**
 * takes in at least two arguments: first one is the command to execute on redis and the rest arguments are for the command
 * @returns {Promise}
 */
export function doInPromise() {
  const args = [...arguments]
  if (args.length < 1) {
    const errMsg = 'you need to give at least two arguments: first one is the command to execute in redis client, rest are arguments for the command'
    log.e(errMsg)
    throw new Error(errMsg)
  }
  const command = args[0]
  const commandArgs = args.slice(1)
  return new Promise((resolve, reject) => {
    const c = getClient()
    const cb = (err, reply) => {
      if (err) {
        log.e(`error calling ${command} with args ${commandArgs}`)
        reject(err)
      } else {
        log.d('reply is:' + reply)
        // in case reply value is falsy
        resolve({payload: reply})
      }
    }
    log.d(`about to call redis command ${command} with args [${commandArgs}]`)
    c[command].apply(c, commandArgs.concat(cb))
  })
}