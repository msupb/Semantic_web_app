const { Connection, query } = require('stardog');
var sparqlQuery = require('../modules/queries');

function getStardog() {
  const conn = new Connection({
    username: 'admin',
    password: 'admin',
    endpoint: 'http://localhost:5820',
  });

  return query.execute(conn, 'hospital_db', sparqlQuery.sdQuery)
  .then(({ body }) => {
    return body.results.bindings;
    console.log(body.results.bindings);
  }).catch((err) => {
    console.log(err);
  });
};

module.exports = getStardog;
