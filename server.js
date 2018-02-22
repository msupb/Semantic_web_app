var express = require('express');
var bodyParser = require('body-parser');
const { Connection, query } = require('stardog');
var fetch = require('isomorphic-fetch');
var SparqlHttp = require('sparql-http-client');

var app = express();

app.set("view engine", "hbs");

app.use(bodyParser.urlencoded({extended: false}));

app.get("/", function(request, response){
  response.render("index", {stardogList: stardogList});
});

var stardogList = [];
var list1 = [];
var list2 = [];

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
'SELECT ?x ?name ?city ?county ?phone ?email ?lat ?long WHERE{?x a foaf:Organization ;foaf:name ?name .?x dbo:City ?city .?x dbo:county ?county .?x foaf:mbox ?email .?x foaf:phone ?phone .?x geo:lat ?lat .?x geo:long ?long }'
/*
* Execute query to Stardog db
*/
query.execute(conn, 'hospital_db', q2).then(({ body }) => {
  stardogList = body.results.bindings;
  console.log(stardogList);
}).catch((err) => {
  console.log(err);
});

/*
* Execute query to endpoints
*/

SparqlHttp.fetch = fetch

//Dbpedia endpoint
var dpedia = 'http://dbpedia.org/sparql';
//Linked geodata endpoint
var lgd = 'http://linkedgeodata.org/sparql';
//Set endpoint
var endpoint = new SparqlHttp({endpointUrl: dpedia});

var endpoint2 = new SparqlHttp({endpointUrl: lgd});

var dbpq = 'select distinct ?Concept where {[] a ?Concept} LIMIT 1';

var lgdq = 'Prefix lgdr:<http://linkedgeodata.org/triplify/>Prefix lgdo:<http://linkedgeodata.org/ontology/>Select*{ ?s ?p ?o . }Limit 1';

// run dbpedia query
endpoint.selectQuery(dbpq).then(function (res) {
     return res.json()
}).then(function (result) {
      list1 = result.results.bindings;
     //console.log(result.results.bindings)
}).catch(function (err) {
    console.error(err)
})

// run linked geodata query
endpoint2.selectQuery(lgdq).then(function (res) {
     return res.json()
}).then(function (result2) {
      list2 = result2.results.bindings;
     //console.log(result2.results.bindings)
}).catch(function (err) {
    console.error(err)
})

app.listen(3000, () => console.log('App listening to port 3000!'))
