var express = require('express')
const { Connection, query } = require('stardog');
var fetch = require('isomorphic-fetch')
var SparqlHttp = require('sparql-http-client')

var app = express()

//Connection details for local Stardog db
const conn = new Connection({
  username: 'admin',
  password: 'admin',
  endpoint: 'http://localhost:5820',
});

var q = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/> SELECT ?x WHERE{?x a foaf:Organization ;}';

var foaf = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>';
var geo = 'PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>';
var dbo = 'PREFIX dbo: <http://dbpedia.org/ontology/>';

var q2 = foaf + geo + dbo +
'SELECT ?x ?name ?city ?county ?phone ?email ?lat ?longWHERE{?x a foaf:Organization ;foaf:name ?name .?x dbo:City ?city .?x dbo:county ?county .?x foaf:mbox ?email .?x foaf:phone ?phone .?x geo:lat ?lat .?x geo:long ?long }'
/*
* Execute query to Stardog db
*/
query.execute(conn, 'hospital_db', q2).then(({ body }) => {
  console.log(body.results.bindings);
}).catch((err) => {
  console.log(err);
});

/*
* Execute query to dpedia endpoint
*/

SparqlHttp.fetch = fetch

var endpoint = new SparqlHttp({endpointUrl: 'http://dbpedia.org/sparql'})
var dbpq = 'select distinct ?Concept where {[] a ?Concept} LIMIT 5'
// run query with promises
endpoint.selectQuery(dbpq).then(function (res) {
     return res.json()
}).then(function (result) {
     //console.log(result.results.bindings)
}).catch(function (err) {
    console.error(err)
})


app.listen(3000, () => console.log('App listening to port 3000!'))
