var elasticsearch = require('elasticsearch');
var log = require('./logger');
var config = require('./constants').config;

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  //sniffOnStart: true,
  //sniffInterval: 60000,
  requestTimeout: 90000,
  keepAlive: false, //
  apiVersion: '1.6'
});

function createIndexIfNotExist() {
  client.indices.exists({index: config.indexName}).then(function(body) {
    log.i('exists:', body);
    if (!body) {
      return client.indices.create({index: config.indexName});
    } else {
      return 'index exists';
    }
  }).then(function(body) {
    log.i('body', body);
  }).catch(function(err) {
    // TODO check this is correct
    log.e('something wrong ensuring index exists');
    console.log(e.stack);
  });
}

exports.ensureIndex = createIndexIfNotExist;

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

function index(file, meta) {
  return client.index({
    index: config.indexName,
    type: 'meta',
    id: meta.id,
    body: {
      file: file,
      meta: meta
    }
  });
}

exports.index = index;