import redis from 'redis'
import log from '../logger'

let client

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

const getClient = () => {
  if (!client) {
    client = redis.createClient()
    client.on('error', (err) => {
      log.e("Error " + err);
      throw new Error(err)
    })
    client.on('end', () => {
      log.w('Redis connection ended')
    })
  }

  return client;
}

//client.setnx("id:es:next", 1, redis.print);
//client.hset("hash key", "hashtest 1", "some value", redis.print);
//client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
//client.hkeys("hash key", function (err, replies) {
//  console.log(replies.length + " replies:");
//  replies.forEach(function (reply, i) {
//    console.log("    " + i + ": " + reply);
//  });
//client.quit();
//});

const nextIdKey = 'id:next'

function doInPromise() {
  const args = [...arguments]
  if (args.length < 2) {
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

export function endClient () {
  log.w('quiting redis client')
  getClient().quit()
  client = null
}
