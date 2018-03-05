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
var mergeList = require('./modules/mergeList');

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
var resList = [];

//Get data from local Stardog db
getStardog().then(list => {
  for(var i = 0; i < list.length; i++) {
      sdList.push({
        id: list[i].id,
        x: list[i].x.value.replace(/_/g, ' '),
        name: list[i].name.value.replace(/_/g, ' '),
        city: list[i].NCITY.value.replace(/_/g, ' '),
        county: list[i].NCOUNTY.value.replace(/_/g, ' '),
        email: list[i].NMAIL.value.replace(/_/g, ' '),
        phone: list[i].NPHONE.value.replace(/_/g, ' '),
        lat: list[i].NLAT.value,
        long: list[i].NLONG.value,
        address: list[i].NADDRESS.value.replace(/_/g, ' '),
        homepage: list[i].NHOMEPAGE.value
      });
      sdList = addId(sdList);
  }
<<<<<<< HEAD
=======

  //Send http request to dbpedia
  httpQuery(dbpEndpoint, sparqlQuery.dbpQuery, dbpList).then(list => {
    for(var i = 0; i < list.length; i++) {
        dbpList.push({
          z: list[i].x.value,
          opening_year: list[i].NZ.value,
          emergency: list[i].NC.value,
          bed_count: list[i].NB.value,
          comment: list[i].NV.value,
          name: list[i].NN.value,
          region: list[i].NR.value
        });
      }
      //Calls custom method to transfer object properties from dbpList to sdList
      sdList = mergeList(sdList, dbpList);
      console.log(sdList);
  });
>>>>>>> 73bbec15fa7c32dcd891518912bf4fef4abd68d3
  //console.log(sdList);
});

//Routes
app.get("/", function(req, res){
  res.render('index', {sdList: sdList});
});

app.get('/index/:id/:name', function(req, res){
  var id = req.params.id;
  var name = req.params.name;
  var temp = [];

  temp.push({
    name: sdList[id].name,
    city: sdList[id].city,
    county: sdList[id].county,
    email: sdList[id].email,
    long: sdList[id].long,
    lat: sdList[id].lat,
    phone: sdList[id].phone,
    address: sdList[id].address,
    homepage: sdList[id].homepage
  });

  var dbpQuery = '\
  PREFIX dbp: <http://dbpedia.org/property/>\
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
  PREFIX dbr: <http://dbpedia.org/resource/>\
  PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>\
  PREFIX dbo: <http://dbpedia.org/ontology/>\
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
  SELECT DISTINCT ?x ?a ?z ?c ?b \
  WHERE\
  {\
  ?x\
    dbo:abstract ?a ;\
    dbo:openingYear ?z ;\
    dbp:emergency ?c ;\
    dbo:bedCount ?b ;\
    rdfs:label "'+name+'"@en .\
  }\
  GROUP BY ?x';

  //Send http request to dbpedia
  httpQuery(dbpEndpoint, dbpQuery, dbpList).then(list => {
    for(var i = 0; i < list.length; i++) {
       dbpList.push({
         x: list[i].x.value,
         abstract: list[i].a.value,
         opening_year: list[i].z.value,
         bed_count: list[i].b.value,
         emergency: list[i].c.value
        });
      }
      res.render('details', {dbpList: dbpList, temp: temp});
      dbpList = [];
   });
});

app.post('/resList', function(req, res){
  var coords = req.body.coords;

  res.send('Success');

  var geoQuery = '\
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
