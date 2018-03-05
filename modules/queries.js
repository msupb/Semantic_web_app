<<<<<<< HEAD
exports.sdQuery = '\
PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>\
PREFIX dbo: <http://dbpedia.org/ontology/>\
SELECT DISTINCT ?x ?name (SAMPLE(?city) AS ?NCITY) (SAMPLE(?county) AS ?NCOUNTY) (SAMPLE(?phone) AS ?NPHONE) (SAMPLE(?email) AS ?NMAIL) (SAMPLE(?address) AS ?NADDRESS) (SAMPLE(?lat) AS ?NLAT) (SAMPLE(?long) AS ?NLONG) (SAMPLE(?homepage) AS ?NHOMEPAGE)\
 WHERE\
 {\
   ?x a foaf:Organization ;\
   foaf:name ?name ;\
   dbo:city ?city ;\
   dbo:county ?county ;\
   foaf:mbox ?email ;\
   foaf:address ?address ;\
   foaf:phone ?phone ;\
   geo:lat ?lat ;\
   geo:long ?long ;\
   foaf:homepage ?homepage .\
 }\
 GROUP BY ?x ?name';

exports.dbpQuery = '\
 PREFIX dbp: <http://dbpedia.org/property/>\
 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
 PREFIX dbr: <http://dbpedia.org/resource/>\
 PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>\
 PREFIX dbo: <http://dbpedia.org/ontology/>\
 SELECT DISTINCT ?x (SAMPLE(?z) AS ?NZ) (SAMPLE(?c) AS ?NC) (SAMPLE(?b) AS ?NB) (SAMPLE(?v) AS ?NV) (SAMPLE(?n) AS ?NN) (SAMPLE(?r) AS ?NR)\
 WHERE\
 {\
 ?x a dbo:Hospital ;\
    dbo:state dbr:England ;\
    dbo:openingYear ?z ;\
    dbp:emergency ?c ;\
    dbo:bedCount ?b ;\
    rdfs:comment ?v ;\
    rdfs:label ?n ;\
    dbp:region ?r . \
 }\
 GROUP BY ?x';
=======
exports.sdQuery = '\
PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>\
PREFIX dbo: <http://dbpedia.org/ontology/>\
SELECT DISTINCT ?x ?name (SAMPLE(?city) AS ?NCITY) (SAMPLE(?county) AS ?NCOUNTY) (SAMPLE(?phone) AS ?NPHONE) (SAMPLE(?email) AS ?NMAIL) (SAMPLE(?address) AS ?NADDRESS) (SAMPLE(?lat) AS ?NLAT) (SAMPLE(?long) AS ?NLONG) (SAMPLE(?homepage) AS ?NHOMEPAGE)\
 WHERE\
 {\
   ?x a foaf:Organization ;\
   foaf:name ?name ;\
   dbo:city ?city ;\
   dbo:county ?county ;\
   foaf:mbox ?email ;\
   foaf:address ?address ;\
   foaf:phone ?phone ;\
   geo:lat ?lat ;\
   geo:long ?long ;\
   foaf:homepage ?homepage .\
 }\
 GROUP BY ?x ?name';

exports.dbpQuery = '\
 PREFIX dbp: <http://dbpedia.org/property/>\
 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
 PREFIX dbr: <http://dbpedia.org/resource/>\
 PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>\
 PREFIX dbo: <http://dbpedia.org/ontology/>\
 SELECT DISTINCT ?x (SAMPLE(?z) AS ?NZ) (SAMPLE(?c) AS ?NC) (SAMPLE(?b) AS ?NB) (SAMPLE(?v) AS ?NV) (SAMPLE(?n) AS ?NN) (SAMPLE(?r) AS ?NR)\
 WHERE\
 {\
 ?x a dbo:Hospital ;\
    dbo:state dbr:England ;\
    dbo:openingYear ?z ;\
    dbp:emergency ?c ;\
    dbo:bedCount ?b ;\
    rdfs:comment ?v ;\
    rdfs:label ?n ;\
    dbp:region ?r . \
 }\
 GROUP BY ?x';
>>>>>>> 73bbec15fa7c32dcd891518912bf4fef4abd68d3
