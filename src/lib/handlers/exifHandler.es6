import fs from 'fs'
import exifParser from 'exif-parser'
import log from '../logger'
import moment from 'moment'

const trimValue = (tags) => {
  const result = {}
  Object.keys(tags).forEach((key) => {
    const value = tags[key]
    result[key] = typeof value === 'string' ? value.trim() : value
  })
  return result
}

/**
 * Read photo EXIF information
 * @param file
 * @param meta
 * @param callback
 */
export default function readExif(file, meta, callback) {
  var readableStream = fs.createReadStream(file, {start: 0, end: 65635});

  readableStream.on('readable', () => {
    let chunk = readableStream.read(65535)

    if (!meta.exif && null !== chunk) {
      log.d('=== reading EXIF from file: %s', file)
      const parser = exifParser.create(chunk)
      const result = parser.parse()
      meta.exif = trimValue(result.tags)
      if (result.tags.CreateDate) {
        meta.createdDate = moment.unix(result.tags['CreateDate']);
      } else if (result.tags.ModifyDate) {
        meta.modifiedDate = moment(result.tags['ModifyDate'], 'YYYY:MM:DD HH:mm:ss')
      }

      //console.log('>> image size: %s', result.getImageSize());
      log.d('>>> image exif tags:', JSON.stringify(result.tags, null, '  '));
      callback(meta);
    }
  });
}