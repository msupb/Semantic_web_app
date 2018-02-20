import {stripIndent} from 'common-tags';
import Stardog from './index';

jest.setTimeout(10000);

const testDb = 'test';

const stardog = new Stardog({
    endpoint: 'http://localhost:5820',
    database: testDb,
    auth: {
        user: 'admin',
        pass: 'admin'
    }
});

beforeAll(async () => {
    await stardog.createDatabase({
        database: testDb
    });

    await stardog.update({
        query: 'insert data {<urn:s> <urn:p> <urn:o>}'
    });
});

afterAll(async () => {
    await stardog.dropDatabase({
        database: testDb
    });
});

describe('databases', () => {
    test('create', async () => {
        await stardog.createDatabase({
            database: 'create'
        });

        expect(await stardog.existsDatabase({
            database: 'create'
        })).toBe(true);

        stardog.dropDatabase({
            database: 'create'
        });
    });

    test('drop', async () => {
        await stardog.createDatabase({
            database: 'drop'
        });

        expect(await stardog.existsDatabase({
            database: 'drop'
        })).toBe(true);

        await stardog.dropDatabase({
            database: 'drop'
        });

        expect(await stardog.existsDatabase({
            database: 'drop'
        })).toBe(false);
    });

    test('size', async () => {
        expect(await stardog.sizeDatabase({
            database: testDb
        })).toBe(1);
    });

    test('list', async () => {
        expect(await stardog.listDatabases()).toContain(testDb);
    });

    test('exists', async () => {
        expect(await stardog.existsDatabase({
            database: testDb
        })).toBe(true);

        expect(await stardog.existsDatabase({
            database: testDb + '2'
        })).toBe(false);
    });

    describe('meta', () => {
        test('all fields', async () => {
            expect(Object.keys(await stardog.metaDatabase({
                database: testDb
            }))).toHaveLength(37);
        });

        test('custom field', async () => {
            const meta = await stardog.metaDatabase({
                database: testDb,
                fields: [
                    'database.online'
                ]
            });

            expect(Object.keys(meta)).toHaveLength(1);
            expect(meta['database.online']).toBe(true);
        });
    });

    test('online', async () => {
        await stardog.offDatabase({
            database: testDb
        });

        expect((await stardog.metaDatabase({
            database: testDb,
            fields: [
                'database.online'
            ]
        }))['database.online']).toBe(false);

        await stardog.onDatabase({
            database: testDb
        });

        expect((await stardog.metaDatabase({
            database: testDb,
            fields: [
                'database.online'
            ]
        }))['database.online']).toBe(true);
    });

    test('offline', async () => {
        expect((await stardog.metaDatabase({
            database: testDb,
            fields: [
                'database.online'
            ]
        }))['database.online']).toBe(true);

        await stardog.offDatabase({
            database: testDb
        });

        expect((await stardog.metaDatabase({
            database: testDb,
            fields: [
                'database.online'
            ]
        }))['database.online']).toBe(false);

        await stardog.onDatabase({
            database: testDb
        });
    });

    test('copy', async () => {
        await stardog.offDatabase({
            database: testDb
        });

        await stardog.copyDatabase({
            from: testDb,
            to: testDb + '2'
        });

        expect(await stardog.existsDatabase({
            database: testDb + '2'
        })).toBe(true);

        await stardog.onDatabase({
            database: testDb
        });

        await stardog.dropDatabase({
            database: testDb + '2'
        });
    });

    describe('export', () => {
        test('default accept', async () => {
            expect((await stardog.exportDatabase({
                database: testDb
            })).replace(/\r\n/g, '\n').trim()).toBe(stripIndent`
                @prefix : <http://api.stardog.com/> .
                @prefix owl: <http://www.w3.org/2002/07/owl#> .
                @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
                @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
                @prefix stardog: <tag:stardog:api:> .
                @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

                <urn:s> <urn:p> <urn:o> .
            `);
        });

        test('accept n-triples', async () => {
            expect(await stardog.exportDatabase({
                database: testDb,
                accept: 'application/n-triples'
            })).toBe('<urn:s> <urn:p> <urn:o> .\n');
        });
    });
});

describe('graphs', () => {
    test('drop', async () => {
        await stardog.update({
            query: 'insert data {<urn:drop> <urn:drop> <urn:drop>}',
            insertGraph: 'urn:drop'
        });

        expect(await stardog.existsGraph({
            graph: 'urn:drop'
        })).toBe(true);

        await stardog.dropGraph({
            graph: 'urn:drop'
        });

        expect(await stardog.existsGraph({
            graph: 'urn:drop'
        })).toBe(false);
    });

    test('copy', async () => {
        await stardog.update({
            query: 'insert data {<urn:copy> <urn:copy> <urn:copy>}',
            insertGraph: 'urn:from'
        });

        expect(await stardog.existsGraph({
            graph: 'urn:to'
        })).toBe(false);

        await stardog.copyGraph({
            from: 'urn:from',
            to: 'urn:to'
        });

        expect(await stardog.existsGraph({
            graph: 'urn:to'
        })).toBe(true);

        await Promise.all([
            stardog.dropGraph({
                graph: 'urn:from'
            }),
            stardog.dropGraph({
                graph: 'urn:to'
            })
        ]);
    });

    test('move', async () => {
        await stardog.update({
            query: 'insert data {<urn:move> <urn:move> <urn:move>}',
            insertGraph: 'urn:from'
        });

        expect(await stardog.existsGraph({
            graph: 'urn:to'
        })).toBe(false);

        await stardog.moveGraph({
            from: 'urn:from',
            to: 'urn:to'
        });

        expect(await stardog.existsGraph({
            graph: 'urn:from'
        })).toBe(false);

        expect(await stardog.existsGraph({
            graph: 'urn:to'
        })).toBe(true);

        await Promise.all([
            stardog.dropGraph({
                graph: 'urn:to'
            })
        ]);
    });

    test('add', async () => {
        await Promise.all([
            stardog.update({
                query: 'insert data {<urn:from> <urn:from> <urn:from>}',
                insertGraph: 'urn:from'
            }),
            stardog.update({
                query: 'insert data {<urn:to> <urn:to> <urn:to>}',
                insertGraph: 'urn:to'
            })
        ]);

        await stardog.addGraph({
            from: 'urn:from',
            to: 'urn:to'
        });

        expect(await stardog.ask({
            graph: 'urn:to',
            query: stripIndent`
                ask {
                    <urn:from> <urn:from> <urn:from> .
                    <urn:to> <urn:to> <urn:to>
                }
            `
        })).toBe(true);

        await Promise.all([
            stardog.dropGraph({
                graph: 'urn:from'
            }),
            stardog.dropGraph({
                graph: 'urn:to'
            })
        ]);
    });

    test('list', async () => {
        expect(await stardog.listGraphs()).toEqual([]);

        await stardog.update({
            query: 'insert data {<urn:list> <urn:list> <urn:list>}',
            insertGraph: 'urn:graph'
        });

        await stardog.update({
            query: 'insert data {<urn:list> <urn:list> <urn:list>}',
            insertGraph: 'urn:graph2'
        });

        expect(await stardog.listGraphs()).toEqual(['urn:graph', 'urn:graph2']);

        await Promise.all([
            stardog.dropGraph({
                graph: 'urn:graph'
            }),
            stardog.dropGraph({
                graph: 'urn:graph2'
            })
        ]);
    });

    test('exists', async () => {
        expect(await stardog.existsGraph({
            graph: 'urn:exists'
        })).toBe(false);

        await stardog.update({
            query: 'insert data {<urn:exists> <urn:exists> <urn:exists>}',
            insertGraph: 'urn:exists'
        });

        expect(await stardog.existsGraph({
            graph: 'urn:exists'
        })).toBe(true);

        await stardog.dropGraph({
            graph: 'urn:exists'
        });
    });
});

describe('queries', () => {
    test('ask', async () => {
        expect(await stardog.ask({
            query: 'ask {<urn:s> <urn:p> <urn:o>}'
        })).toBe(true);

        expect(await stardog.ask({
            query: 'ask {<urn:s> <urn:p> <urn:p>}'
        })).toBe(false);
    });

    test('select', async () => {
        expect(await stardog.query({
            query: 'select * where {?s ?p ?o}'
        })).toEqual({
            head: {vars: ['s', 'p', 'o']},
            results: {
                bindings: [{
                    s: {type: 'uri', value: 'urn:s'},
                    p: {type: 'uri', value: 'urn:p'},
                    o: {type: 'uri', value: 'urn:o'}
                }]
            }
        });
    });

    test('construct', async () => {
        expect(await stardog.query({
            query: 'construct {?s ?p ?o} where {?s ?p ?o}'
        })).toBe('\r\n<urn:s> <urn:p> <urn:o> .\r\n');
    });
});

describe('update queries', () => {
    test('insert', async () => {
        await stardog.update({
            query: 'insert data {<urn:insert> <urn:insert> <urn:insert>}'
        });

        expect(await stardog.ask({
            query: 'ask {<urn:insert> <urn:insert> <urn:insert>}'
        })).toBe(true);

        await stardog.update({
            query: 'delete data {<urn:insert> <urn:insert> <urn:insert>}'
        });
    });

    test('remove', async () => {
        await stardog.update({
            query: 'insert data {<urn:remove> <urn:remove> <urn:remove>}'
        });

        expect(await stardog.ask({
            query: 'ask {<urn:remove> <urn:remove> <urn:remove>}'
        })).toBe(true);

        await stardog.update({
            query: 'delete data {<urn:remove> <urn:remove> <urn:remove>}'
        });

        expect(await stardog.ask({
            query: 'ask {<urn:remove> <urn:remove> <urn:remove>}'
        })).toBe(false);
    });
});
