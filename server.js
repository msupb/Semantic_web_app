var express = require('express');
var bodyParser = require('body-parser');
const { Connection, query } = require('stardog');
var fetch = require('isomorphic-fetch');
var SparqlHttp = require('sparql-http-client');
var path = require('path');
var hbs = require('handlebars');

var app = express();

app.use('/views', express.static(__dirname + '/views'));
app.set('view engine', 'hbs');

var Handlebars = require('hbs');

Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

app.use(bodyParser.urlencoded({extended: false}));

//Routes
app.get("/", function(req, res){
  z = 0;
  res.render("index", {list: list});
});

app.get("/index/:id", function(req, res){
  var id = req.params.id;
  res.render('details', list[id]);
});

//Lists
var list = [];
var list1 = [];
var list2 = [];
var temp = [];

//Add id to each object in array for routing purposes
function addId(arr) {
  return arr.map(function(obj, index) {
  return Object.assign({}, obj, { id: index });
  });
};

//Connection details for local Stardog db
const conn = new Connection({
  username: 'admin',
  password: 'admin',
  endpoint: 'http://localhost:5820',
});
//Queries
var q = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/> SELECT ?x WHERE{?x a foaf:Organization ;}';

var foaf = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>';
var geo = 'PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>';
var dbo = 'PREFIX dbo: <http://dbpedia.org/ontology/>';
var rdfs = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>';
var ogc = 'PREFIX ogc: <http://www.opengis.net/ont/geosparql#>';
var geom = 'PREFIX geom: <http://geovocab.org/geometry#>';
var lgdo = 'PREFIX lgdo: <http://linkedgeodata.org/ontology/>';

var q2 = foaf + geo + dbo +
'SELECT ?x ?name ?city ?county ?phone ?email ?lat ?long WHERE{?x a foaf:Organization ;foaf:name ?name ;dbo:City ?city ;dbo:county ?county ;foaf:mbox ?email ;foaf:phone ?phone ;geo:lat ?lat ;geo:long ?long .}'
/*
* Execute query to Stardog db
*/
query.execute(conn, 'hospital_db', q2).then(({ body }) => {
  temp = body.results.bindings;
  temp = addId(temp);
  for(var i = 0; i < temp.length; i++) {
      tempObj = {
        id: temp[i].id,
        x: temp[i].x.value,
        name: temp[i].name.value,
        city: temp[i].city.value,
        county: temp[i].county.value,
        email: temp[i].email.value,
        phone: temp[i].phone.value,
        lat: temp[i].lat.value,
        long: temp[i].long.value
      };
      list.push(tempObj);
  }
  //console.log(list);
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

var geoq = rdfs + ogc + geom + lgdo + 'Select * From <http://linkedgeodata.org> {?s a lgdo:Amenity ; rdfs:label ?l ; geom:geometry [ogc:asWKT ?g] . Filter(bif:st_intersects (?g, bif:st_point (12.372966, 51.310228), 0.1)) .}';

// run http query
var httpQuery = function(ep, q, lst) {
  ep.selectQuery(q).then(function (res) {
       return res.json()
  }).then(function (result) {
        lst = result.results.bindings;
       console.log(lst)
  }).catch(function (err) {
      console.error(err)
  })
}

//httpQuery(endpoint, dbpq, list1);
httpQuery(endpoint2, geoq, list2);

app.listen(3000, () => console.log('Listening to port 3000!'))
