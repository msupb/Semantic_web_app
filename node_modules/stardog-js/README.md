# stardog-js
Node.js library for communicating with the Stardog HTTP server.

## Installation

```sh
$ npm i request
$ npm i stardog-js
```

`request` is defined as a peer-dependency and thus has to be installed separately.

## Testing

Run Stardog HTTP server on http://localhost:5820.

```sh
$ npm test
```

## Import

### Using CommonJS

Requirements (Node.js >= 8.0.0).
```js
const Stardog = require('stardog-js');
```

### Using ESM

Use --experimental-modules flag and .mjs extension (Node.js >= 8.6.0).
```js
import Stardog from 'stardog-js';
```

## Usage

### Create instances

```js
// Create instance with only endpoint (required option)

const stardog = new Stardog({
    endpoint: 'http://localhost:5820'
});

// Create instance with credentials and database name (optional)

const stardog = new Stardog({
    endpoint: 'http://localhost:5820',
    database: 'database',
    auth: {
        user: 'user',
        pass: 'pass'
    }
});
```

### Invoke methods

```js
// Credentials and database are optional,
// this have lower priority than constructor settings

const data = await stardog.query({
    database: 'database',
    auth: {
        user: 'user',
        pass: 'pass'
    },
    query: 'select * where {?s ?p ?o}'
}).catch((err) => {
    return Promise.reject(err);
});
```

### Examples

```js
import Stardog from 'stardog-js';

const stardogAdminDatabase = new Stardog({
    endpoint: 'http://localhost:5820',
    database: 'database',
    auth: {
        user: 'admin',
        pass: 'admin'
    }
});

const stardogAdmin = new Stardog({
    endpoint: 'http://localhost:5820',
    auth: {
        user: 'admin',
        pass: 'admin'
    }
});

const stardog = new Stardog({
    endpoint: 'http://localhost:5820'
});

(async () => {
    const data1 = await stardogAdminDatabase.query({
        query: 'select * where {?s ?p ?o}'
    });

    const data2 = await stardogAdmin.query({
        database: 'database',
        query: 'select * where {?s ?p ?o}'
    });

    const data3 = await stardog.query({
        database: 'database',
        auth: {
            user: 'admin',
            pass: 'admin'
        },
        query: 'select * where {?s ?p ?o}'
    });
})();

```

## API

### Databases

#### createDatabase

Create new database.

```js
stardog.createDatabase({
    database: 'database'
});
```

#### dropDatabase

Drop database.

```js
stardog.dropDatabase({
    database: 'database'
});
```

#### sizeDatabase

Get size database.

```js
const size = await stardog.sizeDatabase({
    database: 'database'
});
```

#### listDatabases

Get list databases.

```js
const databases = await stardog.listDatabases();
```

#### existsDatabase

Check exists database.

```js
if (await stardog.existsDatabase({
        database: 'database'
    })) {
    console.log('exists');
}
```

#### metaDatabase

Get metadata options for database.

```js
// Returns all metadata options

const meta = await stardog.metaDatabase({
    database: 'database'
});

/*
options: {
    'database.archetypes': '',
    'database.connection.timeout': '',
    'database.name': '',
    'database.namespaces': '',
    'database.online': '',
    'database.time.creation': '',
    'database.time.modification': '',
    'icv.active.graphs': '',
    'icv.consistency.automatic': '',
    'icv.enabled': '',
    'icv.reasoning.enabled': '',
    'index.differential.enable.limit': '',
    'index.differential.merge.limit': '',
    'index.differential.size': '',
    'index.literals.canonical': '',
    'index.named.graphs': '',
    'index.persist': '',
    'index.persist.sync': '',
    'index.size': '',
    'index.statistics.update.automatic': '',
    'index.type': '',
    'preserve.bnode.ids': '',
    'query.all.graphs': '',
    'query.timeout': '',
    'reasoning.approximate': '',
    'reasoning.consistency.automatic': '',
    'reasoning.punning.enabled': '',
    'reasoning.sameas': '',
    'reasoning.schema.graphs': '',
    'reasoning.schema.timeout': '',
    'reasoning.type': '',
    'reasoning.virtual.graph.enabled': '',
    'search.enabled': '',
    'search.reindex.mode': '',
    'spatial.enabled': '',
    'strict.parsing': '',
    'transaction.isolation': '',
    'transaction.logging': ''
}
*/

// Get custom fields

const meta = await stardog.metaDatabase({
    database: 'database',
    fields: [
        'database.online',
        'database.time.creation'
    ]
});
```

#### onDatabase

Bring the database online.

```js
stardog.onDatabase({
    database: 'database'
});
````

#### offDatabase

Bring the database offline.

```js
stardog.offDatabase({
    database: 'database'
});
````

#### copyDatabase

Copy database.

```js
// Bring the database offline

await stardog.offDatabase({
    database: 'from'
});

// Copy database 'from' to database 'to'

await stardog.copyDatabase({
    from: 'from',
    to: 'to'
});
````

#### exportDatabase

Export database.

```js
stardog.exportDatabase({
    database: 'database'
});

// Export database with accept

stardog.exportDatabase({
    database: 'database',
    accept: 'application/n-triples'
});
```

### Graphs

#### dropGraph

Drop named graph.

```js
stardog.dropGraph({
    graph: 'urn:graph'
});
```

#### copyGraph

Copy named graph.

```js
stardog.copyGraph({
    from: 'urn:from',
    to: 'urn:to'
});
```

#### moveGraph

Move named graph.

```js
stardog.moveGraph({
    from: 'urn:from',
    to: 'urn:to'
});
```

#### addGraph

Insert data from source named graph to destination.

```js
stardog.addGraph({
    from: 'urn:from',
    to: 'urn:to'
});
```

#### listGraphs

Get list of named graphs.

```js
const graphs = await stardog.listGraphs();
```

#### existsGraph

Check exists named graph.

```js
const exists = await stardog.existsGraph({
    graph: 'urn:graph'
});
```

### Queries

#### query

Execute query.

```js
const data = await stardog.query({
    query: 'select * where {?s ?p ?o}'
});

// Set accept to 'text/boolean', returns true or false

const data = await stardog.query({
    accept: 'text/boolean',
    query: 'ask {<urn:a> <urn:b> <urn:c>}'
});

const data = await stardog.query({
    query: 'construct {?s ?p ?o} where {?s ?p ?o}'
});

// Query to named graph 'tag:stardog:api:context:default'

const data = await stardog.query({
    query: 'select * where {?s ?p ?o}',
    graph: 'tag:stardog:api:context:default',
    offset: 0,
    limit: 1,
    timeout: 1000,
    reasoning: true
});

// Query to two named graphs

const data = await stardog.query({
    query: 'select * where {?s ?p ?o}',
    graph: ['urn:graph', 'urn:graph2']
});
```

#### ask

Alias for `query` with accept `text/boolean`.

```js
const data = await stardog.ask({
    query: 'ask {<urn:a> <urn:b> <urn:c>}'
});

// Equal query

const data = await stardog.query({
    accept: 'text/boolean',
    query: 'ask {<urn:a> <urn:b> <urn:c>}'
});
```

#### update

Execute update query.

```js
stardog.update({
    query: 'insert data {<urn:a> <urn:b> <urn:c>}'
});

stardog.update({
    query: 'delete data {<urn:a> <urn:b> <urn:c>}'
});

// Insert to named graph 'urn:graph'

stardog.update({
    query: 'insert data {<urn:a> <urn:b> <urn:c>}',
    insertGraph: 'urn:graph'
});

// Remove from named graph 'urn:graph'

stardog.update({
    query: 'delete data {<urn:a> <urn:b> <urn:c>}',
    removeGraph: 'urn:graph'
});
```
