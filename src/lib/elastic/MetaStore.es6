import request from 'superagent'
import log from './../logger'
import {config} from '../constants'
import {isPhoto, checkError, fileName} from '../util'

import settings from './indexSettings'

import {nextId} from '../redis/uniqueId'

const esBase = 'http://localhost:9200'

const indexName = config.indexName

function createIndex (indexName) {
  const url = `${esBase}/${indexName}`
  new Promise((resolve, reject) => {
    request
        .put(url)
        .set('Content-Type', 'application/json')
        .send(settings)
        .end((err, res) => {
          if (err || !res.ok) {
            log.e('error talking to ' + url, err, res)
            reject(err || new Error(res.status))
          } else {
            resolve(res.body)
          }
        })
  })
}

function createIndexIfNotExist() {
  const url =`${esBase}/${indexName}`

  return new Promise((resolve, reject) => {
    request
        .head(url)
        .end((err, res) => {
          // TODO use folktale.js for functional refactor
          if (err && err.status === 404) {
            resolve({})
          } else if (err) {
            log.e('error talking to ' + url, err)
            reject(err)
          } else {
            resolve({index: indexName})
          }
        })
  }).then(index => {
    if (index.index) {
      log.i('>>> index exists')
      return indexName
    }
    log.i('>>> creating index ' + indexName)
    return createIndex(indexName)

  }).catch(checkError)

}

const toFileType = (file) => {
  return isPhoto(file) ? 'photo' : 'video'
}

const toIndexDocPayload = (id, file, meta) => {
  const {fileOrigin, sha1sum, size, createdDate, exif} = meta
  const fileType = toFileType(file)
  return {
    id: Number.parseInt(id), // so that we can sort it
    file,
    fileOrigin,
    fileType,
    sha1sum,
    size,
    createdDate,
    exif,
    title: fileName(file)
  }
}

const index = (file, meta) => {
  const type = toFileType(file)

  return nextId().then(nextId => {
    const url = `${esBase}/${indexName}/${type}/${nextId}`
    const payload = toIndexDocPayload(nextId, file, meta)
    log.i('===== index payload =====', JSON.stringify(payload))

    return new Promise((resolve, reject) => {
      request.put(url)
          .send(payload)
          .end((err, res) => {
            if (err) {
              // TODO log all error to a file
              console.error(`Error indexing ${file}`, err)
              reject(err)
            } else {
              resolve(res.body)
            }
          })
    })
  })

}

function isAlive () {
  const url = `${esBase}/_cat/indices?v`
  return new Promise((resolve, reject) => {
    request
        .get(url)
        .end((err, res) => {
          if (err) {
            log.e('elastic search does not seem to be running', err)
            reject(err)
          } else {
            resolve(res.body)
          }
        })
  }).then(body => {
    log.i('>> elastic search is up', body)
    return {}
  }).catch(checkError)
}

export default {
  ensureIndex: createIndexIfNotExist,
  index,
  isAlive
}