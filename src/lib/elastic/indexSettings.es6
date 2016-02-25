// https://www.elastic.co/guide/en/elasticsearch/reference/current/multi-fields.html
// file is indexed by smartcn analyzer https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-smartcn.html
// file.raw is not indexed for sorting or aggregation
import fs from 'fs'
import appRooDir from 'app-root-dir'

const enStopWords = fs.readFileSync(appRooDir.get() + '/en_stopwords.txt', {encoding: 'utf8'})
const enStopWordsArray = enStopWords.split('\n');

const commonProperties = {
  "file": {
    "type": "string",
    "analyzer": "path",
    "fields": {
      "raw": {
        "type": "string",
        "index": "not_analyzed"
      }
    }
  },
  "fileOrigin": {
    "type": "string",
    "analyzer": "path"
  },
  "fileType": {
    "type": "string",
    "index": "not_analyzed"
  },
  "sha1sum": {
    "type": "string",
    "index": "not_analyzed"
  },
  "createdDate": {
    "type": "date"
  },
  "tags": {
    "type": "string",
    "analyzer": "my_nGram"
  },
  "size": {
    "type": "long"
  }
}

const exifDateFormat = "yyyy:MM:dd HH:mm:ss||yyyy:MM:dd||epoch_millis"
const dateFormat = exifDateFormat + "||yyyy-MM-dd HH:mm:ss||yyyy-MM-dd"

const exifProperties = {
  "exif": {
    "properties": {
      "Make": {
        "type": "string"
      },
      "Model": {
        "type": "string"
      },
      "CreateDate": {
        "type": "date"
      },
      "Software": {
        "type": "string",
        "index": "not_analyzed"
      },
      "ModifyDate": {
        "type": "date",
        "format": exifDateFormat
      },
      "FocalLength": {
        "type": "double"
      },
      "ApertureValue": {
        "type": "double"
      },
      "ExposureTime": {
        "type": "double"
      },
      "DateTimeOriginal": {
        "type": "date"
      },
      "GPSDateStamp": {
        "type": "date",
        "format": exifDateFormat
      },
      "SerialNumber": {
        "type": "string",
        "index": "not_analyzed"
      },
      "LensMake": {
        "type": "string"
      },
      "LensModel": {
        "type": "string"
      }
    }
  }
}

const exifDynamicTemplate = [
  {
    "all_numbers": {
      "path_match": "exif.*",
      "match_mapping_type": "long",
      "mapping": {
        "type": "long"
      }
    }
  },
  {
    "all_strings": {
      "path_match": "exif.*",
      "match_mapping_type": "string",
      "mapping": {
        "type": "string",
        "index": "not_analyzed",
        "ignore_above": 256
      }
    }
  }
]

const photoProperties = Object.assign({}, commonProperties, exifProperties)
const videoProperties = Object.assign({}, commonProperties)

const mappings = {
  "photo": {
    "dynamic_templates": exifDynamicTemplate,
    "properties": photoProperties
  },
  "video": {
    "properties": videoProperties
  }
}

const analysis = {
  "filter" : {
    "my_nGram_filter" : {
      "type" : "nGram",
      "min_gram": 2,
      "max_gram": 3
    },
    "my_stop_filter": {
      "type": "stop",
      "stopwords": enStopWordsArray
    }
  },
  "analyzer": {
    "smartcn": {
      "type": "smartcn"
    },
    "my_nGram": {
      "type": "custom",
      "tokenizer": "my_ngram_tokenizer",
      "filter": ["standard", "lowercase", "my_stop_filter", "word_delimiter", "my_nGram_filter"]
    },
    "path": {
      "type": "custom",
      "tokenizer": "smartcn_tokenizer",
      "filter": ["standard", "lowercase", "my_stop_filter", "word_delimiter"]
    },
    "default": {
      "alias": ["standard", "standard_en"],
      "type": "standard",
      "stopwords": enStopWordsArray
    }
  },
  "tokenizer" : {
    "my_ngram_tokenizer" : {
      "type" : "nGram",
      "min_gram" : 2,
      "max_gram" : 3,
      "token_chars": [ "letter", "digit" ]
    }
  }
}

export default {
  "settings": {
    analysis
  },
  mappings
}