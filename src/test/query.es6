const searchByDate = {
  "query": {
    "range": {
      "createdDate": {
        "lt": "2015-01-01"
      }
    }
  }
}

const searchByDateFuzzy = {
  "_source": { // control what part of the source is returned using include and exclude
    "include": [ "file", "fileOrigin", "exif.*" ],
    "exclude": [ "*.description" ]
  },
  "query": {
    "fuzzy": {
      "createdDate": {
        "value": "2015-02-05",
        "fuzziness": "100d"
      }
    }
  }
}

// https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html
const searchByMake = {
  "query": {
    "bool": {
      "must": [{
        "match": {"_all": "pentaxQ"}
      }
      ]
    }
  }
}

// GET _search
/*
 The title field contains the word search.
 The content field contains the word elasticsearch.
 The status field contains the exact word published.
 The publish_date field contains a date from 1 Jan 2015 onwards.
 */
const queryAndFilter = {
  "query": { // The query parameter indicates query context.
    "bool": { // The bool and two match clauses are used in query context, which means that they are used to score how well each document matches.
      "must": [
        {"match": {"title": "Search"}},
        {"match": {"content": "Elasticsearch"}}
      ],
      "filter": [ // The filter parameter indicates filter context.
        // The term and range clauses are used in filter context. They will filter out documents which do not match, but they will not affect the score for matching documents.
        {"term": {"status": "published"}},
        {"range": {"publish_date": {"gte": "2015-01-01"}}}
      ]
    }
  }
}

// https://www.elastic.co/guide/en/elasticsearch/reference/current/query-filter-context.html
// PUT my_index
const sampleIndex = {
  "mappings": {
    "my_type": {
      "properties": {
        "full_text": { // The full_text field is analyzed by default.
          "type": "string"
        },
        "exact_value": {
          "type": "string",
          "index": "not_analyzed" // The exact_value field is set to be not_analyzed.
        }
      }
    }
  }
}
// PUT my_index/my_type/1
const sampleDoc = {
  "full_text": "Quick Foxes!", // The full_text inverted index will contain the terms: [quick, foxes].
  "exact_value": "Quick Foxes!" // The exact_value inverted index will contain the exact term: [Quick Foxes!].
}






















