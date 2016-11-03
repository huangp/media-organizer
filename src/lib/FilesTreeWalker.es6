import file from 'file'
import {EventEmitter} from 'events'
import {events} from './constants'
import log from './logger'

const Walker = Object.assign({}, EventEmitter.prototype, {
  addListener (event, callback) {
    this.on(event, callback)
  },

  fireEvent (event, payload) {
    this.emit(event, payload)
  },

  scan (sourceDir) {
    const walker = this

    file.walk(sourceDir, (err, dirname, dirs, files) => {
      if (err) {
        log.e('somthing wrong walking the file tree', err)
        throw err
      }
      //console.log('>> entering %s', dirname);
      // TODO if all files are the same type and can handled by same child_process, use one single child process
      files.forEach((file) => walker.fireEvent(events.foundFile, {file: file}))
    })
  }
})

export default Walker
