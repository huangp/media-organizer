// added babel-polyfill require hook to use es6 polyfill http://babeljs.io/docs/usage/polyfill/
import "babel-polyfill";
import handleFile from './lib/handlers/index'
import metaDataCollector from './lib/metaDataCollector'
import {events, config} from './lib/constants'
import log from './lib/logger'

import store from './lib/elastic/MetaStore'
import {goodToGo} from './lib/validator/requiredApps'

import Walker from './lib/FilesTreeWalker'

// TODO read source dir from command line option or some config file
const sourceDir = process.argv[2] || __dirname
const destDir = (process.argv.length > 3 && process.argv[3]) || ''

config.sourceBase = sourceDir
config.destBase = destDir

function scanMedia () {
  store
      .ensureIndex()
      .then(indexName => {
        log.d(`>> scanning: ${config.sourceBase} then index to ${indexName}`);

        Walker.addListener(events.foundFile, handleFile);
        Walker.addListener(events.fileMeta, metaDataCollector);

        Walker.scan(config.sourceBase);
      })
}

export function main () {
  log.i(config);

  const p = goodToGo().then(scanMedia).catch((err) => {
      log.e('something wrong', err)
      process.exit(0)
  })
}
