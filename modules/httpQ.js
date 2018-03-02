var fetch = require('isomorphic-fetch');
var SparqlHttp = require('sparql-http-client');

SparqlHttp.fetch = fetch;

var httpQuery = function(ep, query, arr) {
  return ep.selectQuery(query).then(function (res) {
       return res.json()
  }).then(function (result) {
        return result.results.bindings;
  }).catch(function (err) {
      console.error(err)
  })
};

module.exports = httpQuery;
