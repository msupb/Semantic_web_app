var express = require('express')
const { Connection, query } = require('stardog');
var fetch = require('isomorphic-fetch')
var SparqlHttp = require('sparql-http-client')

var app = express()
/*
app.get('/', function(request, response){
       response.render('index.hbs')
})*/
//var q = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/> SELECT ?x WHERE{?x a foaf:Organization ;}';

const conn = new Connection({
    endpoint: 'http://localhost:5820',
    auth: {
        user: 'admin',
        pass: 'admin'
    }
});

//var q = 'select distinct ?s where { ?s ?p ?o }';

var q = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/> SELECT ?x WHERE{?x a foaf:Organization ;}';
/*
* Execute query to Stardog db
*/
query.execute(conn, 'hospital_db', q, {
}).then(({ body }) => {
  console.log(body.results.bindings);
}).catch((err) => {
  console.log(err);
})

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
     console.log(result.results.bindings)
}).catch(function (err) {
    console.error(err)
})


app.listen(3000, () => console.log('App listening to port 3000!'))
