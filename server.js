var express = require('express');
var bodyParser = require('body-parser');
var SparqlHttp = require('sparql-http-client');
var path = require('path');
var hbs = require('handlebars');
var Handlebars = require('hbs');
var httpQuery = require('./modules/httpQ');
var getStardog = require('./modules/stardog_module');
var addId = require('./modules/addId');
var sparqlQuery = require('./modules/queries');

var app = express();
var port = process.env.PORT || 3000;


//Middleware
app.use('/views', express.static(__dirname + '/views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'hbs');

//Helper for stringifying JSON on client
Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

//Endpoints
var dpedia = 'http://dbpedia.org/sparql';
var lgd = 'http://linkedgeodata.org/sparql';
const dbpEndpoint = new SparqlHttp({endpointUrl: dpedia});
const lgdEndpoint = new SparqlHttp({endpointUrl: lgd});

//Lists
var sdList = [];
var dbpList = [];
var geoList = [];

//Get data from local Stardog db
getStardog().then(list => {
  for(var i = 0; i < list.length; i++) {
      sdList.push({
        id: list[i].id,
        x: list[i].x.value,
        name: list[i].name.value,
        city: list[i].NCITY.value,
        county: list[i].NCOUNTY.value,
        email: list[i].NMAIL.value,
        phone: list[i].NPHONE.value,
        lat: list[i].NLAT.value,
        long: list[i].NLONG.value,
        address: list[i].NADDRESS.value
      });
      sdList = addId(sdList);
  }
  //console.log(sdList);
});

//Send http request to dbpedia
httpQuery(dbpEndpoint, sparqlQuery.dbpQuery, dbpList).then(list => {
  //console.log(list);
  for(var i = 0; i < list.length; i++) {
    dbpList.push({
      x: list[i].x.value,
      openingY: list[i].NZ.value,
      emergency: list[i].NC.value,
      lat: list[i].NB.value,
      long: list[i].NV.value,
      name: list[i].NN.value
    });
  }
  console.log(dbpList);
});


//Routes
app.get("/", function(req, res){
  res.render("index", {sdList: sdList});
});

app.get("/index/:id", function(req, res){
  var id = req.params.id;
  res.render('details', sdList[id]);
});

app.post('/resList', function(req, res){
  var coords = req.body.coords;

  res.send('Success');

  geoQuery = '\
  PREFIX lgdo: <http://linkedgeodata.org/ontology/>\
  PREFIX geom: <http://geovocab.org/geometry#>\
  PREFIX ogc: <http://www.opengis.net/ont/geosparql#>\
  SELECT DISTINCT ?s (SAMPLE(?l) AS ?NL) (SAMPLE(?g) AS ?NG) FROM <http://linkedgeodata.org>\
   {\
     ?s a lgdo:Pharmacy ;\
      rdfs:label ?l ;\
       geom:geometry [ogc:asWKT ?g] .\
       Filter(bif:st_intersects (?g, bif:st_point ('+ coords +'), 10)) .\
     }\
     GROUP BY ?s';
  //Query dbpedia
  httpQuery(lgdEndpoint, geoQuery, geoList)
      .then(list => {
        for(var i = 0; i < list.length; i++) {
          geoList.push({
            s: list[i].s.value,
            l: list[i].NL.value,
            g: list[i].NG.value
          });
        }
        //console.log(list);
        app.get('/geoList', function(req, res){
          res.send({geoList: geoList});
          res.send('Success');
        });
      });
});

app.listen(port);
console.log('Listening to port: ' + port);
