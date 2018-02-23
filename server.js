var express = require('express');
var bodyParser = require('body-parser');
const { Connection, query } = require('stardog');
var fetch = require('isomorphic-fetch');
var SparqlHttp = require('sparql-http-client');
var path = require('path');

var app = express();

app.use('/views', express.static(__dirname + '/views'));
app.set('view engine', 'hbs');

/*hbs.create('json', function(context) {
  return JSON.stringify(context);
});

var hbs = exphbs.create({
  helpers: {
        json: function(context) {
          return JSON.stringify(context);
    }
  }
});*/

var Handlebars = require('hbs');

Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

app.use(bodyParser.urlencoded({extended: false}));

app.get("/", function(request, response){
  response.render("index", {list: list});
});

app.get("/index/:name", function(request, response){
  var x = request.params.name;
  response.render("details", list[x]);
});

var list = [];
var list1 = [];
var list2 = [];

function addId(arr) {
  arr.forEach(function(obj) {
    obj.id = 0;
    if(obj.id = obj.id) obj.id++;
  });
  return arr;
};

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
    list = body.results.bindings;
    addId(list);
    console.log(list);
    return list;
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

// run http query
function sendHttp(q, arr) {
  endpoint.selectQuery(q).then(function (res) {
       return res.json()
  }).then(function (result) {
        arr = result.results.bindings;
       //console.log(arr)
       return arr;
  }).catch(function (err) {
      console.error(err)
  })
};


sendHttp(dbpq, list1);
sendHttp(lgdq, list2);

app.listen(3000, () => console.log('App listening to port 3000!'))
