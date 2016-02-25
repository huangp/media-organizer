import elasticsearch from 'elasticsearch'
import request from 'superagent'
import log from './../logger'
import {config} from '../constants'
import {isPhoto, checkError, fileName} from '../util'

import settings from './indexSettings'

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
        .set('Accept', 'application/json')
        .end((err, res) => {
          // TODO use folktale.js for functional refactor
          if (err && err.status === 404) {
            resolve({})
          } else if (err) {
            log.e('error talking to ' + url, err)
          } else {
            resolve({index: indexName})
          }
        })
  }).then(index => {
    if (index.index) {
      log.i('>>> index exists')
      return undefined
    }
    log.i('>>> creating index ' + indexName)
    return createIndex(indexName)

  }).catch(checkError)

}

function bulkInsert(data) {
  client.bulk({
    body: [
      // action description
      { index:  { _index: 'myindex', _type: 'mytype', _id: 1 } },
      // the document to index
      { title: 'foo' },
      // action description
      { update: { _index: 'myindex', _type: 'mytype', _id: 2 } },
      // the document to update
      { doc: { title: 'foo' } },
      // action description
      { delete: { _index: 'myindex', _type: 'mytype', _id: 3 } },
      // no document needed for this delete
    ]
  });
}

const toFileType = (file) => {
  return isPhoto(file) ? 'photo' : 'video'
}

const toIndexDocPayload = (file, meta) => {
  const {fileOrigin, sha1sum, size, createdDate, exif} = meta
  const fileType = toFileType(file)
  return {
    file,
    fileOrigin,
    fileType,
    sha1sum,
    size,
    createdDate,
    exif
  }
}

const index = (file, meta) => {
  const payload = toIndexDocPayload(file, meta)
  log.i('===== index payload =====', JSON.stringify(payload))

  const type = toFileType(file)
  const url = `${esBase}/${indexName}/${type}`
  return new Promise((resolve, reject) => {
    request.post(url)
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
}

export default {
  ensureIndex: createIndexIfNotExist,
  index
}