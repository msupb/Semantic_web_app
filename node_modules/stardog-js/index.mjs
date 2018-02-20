import * as commonTags from 'common-tags';
import clone from 'clone';
import request from 'request-promise-native';

const {stripIndent} = commonTags;

export default class Stardog {
    constructor(options) {
        this._endpoint = options.endpoint;

        this._options = {
            headers: {
                connection: 'close'
            },
            qsStringifyOptions: {
                arrayFormat: 'repeat'
            },
            resolveWithFullResponse: true
        };

        if (options.auth) {
            this._options.auth = options.auth;
        }
        if (options.database) {
            this._database = options.database;
        }
    }

    async createDatabase(options) {
        const resp = await this._post('/admin/databases', {
            auth: options.auth,
            formData: {
                root: JSON.stringify({
                    dbname: options.database,
                    options: options.options || {},
                    files: options.files || []
                })
            }
        });
    }

    async dropDatabase(options) {
        const resp = await this._delete(`/admin/databases/${options.database}`, {
            auth: options.auth
        });
    }

    async sizeDatabase(options) {
        return parseInt(await this._get(`/${options.database}/size`, {
            auth: options.auth
        }));
    }

    async listDatabases(options = {}) {
        return (await this._get('/admin/databases', {
            auth: options.auth
        })).databases;
    }

    async existsDatabase(options) {
        return (await this.listDatabases({
            auth: options.auth
        })).includes(options.database);
    }

    metaDatabase(options) {
        const fields = {};

        if (options.fields) {
            options.fields.forEach((item) => {
                fields[item] = '';
            });
        }

        return this._put(`/admin/databases/${options.database}/options`, {
            auth: options.auth,
            json: Object.keys(fields).length ? fields : {
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
        });
    }

    onDatabase(options) {
        return this._put(`/admin/databases/${options.database}/online`, {
            auth: options.auth
        });
    }

    offDatabase(options) {
        return this._put(`/admin/databases/${options.database}/offline`, {
            auth: options.auth
        });
    }

    copyDatabase(options) {
        return this._put(`/admin/databases/${options.from}/copy?to=${options.to}`, {
            auth: options.auth
        });
    }

    exportDatabase(options) {
        return this._get(`/${options.database}/export`, {
            auth: options.auth,
            accept: options.accept
        });
    }

    dropGraph(options) {
        return this.update({
            database: options.database,
            auth: options.auth,
            query: `drop graph <${options.graph}>`
        });
    }

    copyGraph(options) {
        return this.update({
            database: options.database,
            auth: options.auth,
            query: `copy <${options.from}> to <${options.to}>`
        });
    }

    moveGraph(options) {
        return this.update({
            database: options.database,
            auth: options.auth,
            query: `move <${options.from}> to <${options.to}>`
        });
    }

    addGraph(options) {
        return this.update({
            database: options.database,
            auth: options.auth,
            query: `add <${options.from}> to <${options.to}>`
        });
    }

    async listGraphs(options = {}) {
        const resp = await this.query({
            database: options.database,
            auth: options.auth,
            accept: 'text/csv',
            query: stripIndent`
                select distinct ?g where {
                    graph ?g {?s ?p ?o}
                }
            `
        });

        const graphs = resp.split(/\r?\n/);

        graphs.shift();
        graphs.pop();

        return graphs;
    }

    async existsGraph(options) {
        return (await this.listGraphs({
            database: options.database,
            auth: options.auth
        })).includes(options.graph);
    }

    ask(options) {
        return this._queryUpdate('query', {
            accept: 'text/boolean',
            ...options
        });
    }

    query(options) {
        return this._queryUpdate('query', {
            accept: 'application/sparql-results+json, text/turtle',
            ...options
        });
    }

    update(options) {
        return this._queryUpdate('update', options);
    }

    _queryUpdate(type, options) {
        const database = this._database || options.database;
        const url = options.tid ? `/${database}/${options.tid}/` : `/${database}/`;

        return this._post(url + type, {
            auth: options.auth,
            accept: options.accept,
            form: {
                query: options.query,
                offset: options.offset,
                limit: options.limit,
                timeout: options.timeout,
                reasoning: options.reasoning,
                'using-graph-uri': options.graph,
                'insert-graph-uri': options.insertGraph,
                'remove-graph-uri': options.removeGraph
            }
        });
    }

    async _request(url, options) {
        const data = clone({
            ...options,
            ...this._options
        });

        url = this._endpoint + url;

        if (data.accept) {
            data.headers.accept = data.accept;
            delete data.accept;
        }
        if (data.contentType) {
            data.headers['content-type'] = data.contentType;
            delete data.contentType;
        }

        data.headers.accept = data.headers.accept || '*/*';

        const resp = await request(url, data);
        const contentType = resp.headers['content-type'];

        if (!contentType || !resp.body) {
            return;
        }
        if (typeof resp.body !== 'string') {
            return resp.body;
        }

        if (contentType.includes('application/sparql-results+json') || contentType.includes('application/json')) {
            try {
                return JSON.parse(resp.body);
            } catch (err) {
                return Promise.reject(new Error(err));
            }
        }
        else if (contentType.includes('text/boolean')) {
            return (resp.body === 'true');
        }

        return resp.body;
    }

    _get(url, options) {
        return this._request(url, {
            ...options,
            method: 'GET'
        });
    }

    _post(url, options) {
        return this._request(url, {
            ...options,
            method: 'POST'
        });
    }

    _put(url, options) {
        return this._request(url, {
            ...options,
            method: 'PUT'
        });
    }

    _delete(url, options) {
        return this._request(url, {
            ...options,
            method: 'DELETE'
        });
    }
}
