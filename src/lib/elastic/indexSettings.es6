// https://www.elastic.co/guide/en/elasticsearch/reference/current/multi-fields.html
// file is indexed by smartcn analyzer https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-smartcn.html
// file.raw is not indexed for sorting or aggregation
const mappings = {
  "photo": {
    "properties": {
      "file": {
        "type": "string",
        "analyzer": "smartcn",
        "fields": {
          "raw": {
            "type": "string",
            "index": "not_analyzed"
          }
        }
      },
      "fileOrigin": {
        "type": "string",
        "analyzer": "directory"
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
      "exif": {
        "properties": {
          "Make": {
            "type": "string",
            "index": "not_analyzed"
          },
          "Model": {
            "type": "string",
            "index": "not_analyzed"
          }

        }

      }
    }
  }
}

const analysis = {
  "analyzer": {
    "smartcn": {
      "type": "smartcn"
    },
    "directory": {
      "type": "pattern",
      "pattern": "/"
    }
  }
}

export default {
  "settings": {
    analysis
  },
  mappings
}