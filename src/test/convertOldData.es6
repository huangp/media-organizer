import fs from 'fs'

import oldData from 'es-old/2016-02-24_all_es_data.json'

import {isPhoto, checkError, fileName} from '../lib/util'



console.log('total: ' + oldData.hits.total)
const oldVideo = {
  "_index": "media",
  "_type": "meta",
  "_id": "329965e892712cd17fea81a8417d6ee48ab28eeb",
  "_score": 1,
  "_source": {
    "file": "/storage/winshare/timeline/2015-09/video/1441417146000_2015-09-05_11-39-06.mp4",
    "meta": {
      "fileOrigin": "/media/pahuang/common/bing_phone/video/VID_20150905_113906.mp4",
      "sha1sum": "c889442c4b017c40dc861fe6641db601d05be47f",
      "handledCount": 3,
      "fileNameDate": "2015-09-05T01:39:06.000Z",
      "lsFullTime": "2015-09-05T10:30:22.517Z",
      "size": "33578785",
      "encodedDate": "2015-09-05T01:39:23.000Z",
      "createdDate": "2015-09-05T01:39:06.000Z",
      "id": "329965e892712cd17fea81a8417d6ee48ab28eeb"
    }
  }
}
const oldPhoto = {
  "_index": "media",
  "_type": "meta",
  "_id": "145958b60d85a03a62de79d698c9e0e2f62582c5",
  "_score": 1,
  "_source": {
    "file": "/storage/winshare/timeline/2013-08/photo/1377275493000_2013-08-24_02-31-33.JPG",
    "meta": {
      "fileOrigin": "/media/pahuang/common/pentaxQ/IMGP0551.JPG",
      "sha1sum": "49977080d03b8c9fb196103e5ee530a054b1962e",
      "handledCount": 2,
      "exif": {
        "Make": "PENTAX             ",
        "Model": "PENTAX Q           ",
        "Orientation": 1,
        "XResolution": 300,
        "YResolution": 300,
        "ResolutionUnit": 2,
        "Software": "PENTAX Q Ver 1.10      ",
        "ModifyDate": "2013:08:23 16:31:34",
        "Artist": "                                ",
        "YCbCrPositioning": 2,
        "Copyright": "                                ",
        "ExposureTime": 0.00625,
        "FNumber": 2.2,
        "ExposureProgram": 7,
        "ISO": 1000,
        "DateTimeOriginal": 1377275493,
        "CreateDate": 1377275493,
        "ExposureCompensation": 0,
        "MeteringMode": 2,
        "Flash": 0,
        "FocalLength": 8.5,
        "ColorSpace": 1,
        "ExifImageWidth": 4000,
        "ExifImageHeight": 3000,
        "SensingMethod": 2,
        "CustomRendered": 0,
        "ExposureMode": 0,
        "WhiteBalance": 0,
        "FocalLengthIn35mmFormat": 47,
        "SceneCaptureType": 2,
        "Contrast": 0,
        "Saturation": 0,
        "Sharpness": 0,
        "SubjectDistanceRange": 1,
        "SerialNumber": "4234407",
        "LensInfo": [
          8.5,
          0,
          1.9,
          0
        ],
        "LensMake": "PENTAX             ",
        "LensModel": "01 STANDARD PRIME",
        "InteropIndex": "R98"
      },
      "createdDate": "2013-08-23T16:31:33.000Z",
      "id": "145958b60d85a03a62de79d698c9e0e2f62582c5"
    }
  }
}
const writer = fs.createWriteStream('/home/pahuang/work/new_data.json')
oldData.hits.hits.forEach(hit => {
  const source = hit['_source']
  const {file, createdDate} = source

  const {fileOrigin, sha1sum, size, exif} = source.meta
  if (exif && typeof exif === 'object') {
    Object.keys(exif).forEach(k => {
      const v = exif[k]
      if (typeof v === 'string') {
        exif[k] = v.trim()
      }
    })
  }
  const fileType = isPhoto(file) ? 'photo' : 'video'
  const data = {
    file, exif, createdDate, fileType, fileOrigin, sha1sum, size, tags: '',
    title: fileName(file)
  }
  writer.write(JSON.stringify(data) + "\n")
})
writer.end()
writer.on('finish', () => {
  console.info('======= done ====')
})

//console.log('new data:' + newData.length)
//console.log(JSON.stringify(newData[1]))