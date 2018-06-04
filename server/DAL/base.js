require('mongoose-relationship');

const extend = require('extend');
const Promise = require('bluebird');
const passError = require('passerror');
const { Schema } = require('mongoose');
const isPlainObject = require('is-plain-object');
const connection = require('../lib/Database');

const noop = Function.prototype;
const getSubset = (obj, keys) => keys.reduce((a, k) => { a[k] = obj[k]; return a; }, {});

class PromisifiedCallback {
    constructor(callback) {
        this.promise = new Promise((resolve, reject) => {
            this.callback = (err, result) => {
                callback(err, result || null);
                if (err) return reject(err);
                return resolve(result);
            };
        });
    }
}

module.exports = (options) => {
    const schemaOptions = options.schema;
    const unique = [].concat(options.unique);

    // handle unique key
    unique.forEach(u => {
        if (typeof schemaOptions[u].type === 'undefined') {
            schemaOptions[u] = { type: schemaOptions[u] };
        }
        extend(schemaOptions[u], { index: true, unique: true });
    });

    const schema = new Schema(schemaOptions);

    // Query manipulations
    // The purpose of this method is not validation but to convert the values in to valid values
    schema.statics.validateQuery = function(...args) {
        let query;
        let isObject = false;
        const key = args[0];

        if (typeof key === 'object') {
            query = key;
            isObject = true;
        } else {
            query = { [key]: args[1] };
        }

        Object.keys(query).forEach(k => {
            if (schemaOptions[k]) {
                const schemaType = (schemaOptions[k].type || schemaOptions[k]);
                const value = query[k];

                if (value === null) {
                    return;
                }

                if (schemaType === Date) {
                    query[k] = new Date(value);
                    if (isNaN(query[k].getTime())) {
                        throw new Error(`Invalid Date (${JSON.stringify(value)}) passed for: ${k}`);
                    }
                } else if (schemaType === Number) {
                    if (!isNaN(value)) {
                        query[k] = Number(value);
                    } else {
                        throw new Error(`Invalid Number (${JSON.stringify(value)}) passed for: ${k}`);
                    }
                } else {
                    if (typeof value === 'string') {
                        try {
                            query[k] = JSON.parse(value);
                        } catch (e) {
                            if (schemaType !== String && schemaType !== Schema.Types.Mixed) {
                                throw new Error(`Invalid value (${JSON.stringify(value)}) passed for: ${k}`);
                            }
                        }
                    }
                }
            }
        });

        return !isObject ? query[key] : query;
    };

    schema.statics.getQuery = function(data) {
        const query = {};
        const isArray = data.constructor === Array;

        unique.forEach((u, i) => {
            query[u] = data[isArray ? i : u];
        });

        this.validateQuery(query);
        return query;
    };

    schema.statics.normalizeQuery = function(query) {
        Object.keys(query).forEach(key => {
            let value = query[key];
            if (isPlainObject(value) || value === null) {
                // plain objects means they are mongo query specific shouldnt need validations
                // null needs no validation
                return;
            }

            if (typeof value === 'object' && value.constructor === Array) {
                const gtValue = this.validateQuery(key, value[0]);
                const ltValue = this.validateQuery(key, value[1]);
                query[key] = { $gte: gtValue, $lte: ltValue };
            } else if (/^</.test(value)) {
                value = this.validateQuery(key, value.slice(1));
                query[key] = { $lte: value };
            } else if (/^>/.test(value)) {
                value = this.validateQuery(key, value.slice(1));
                query[key] = { $gte: value };
            } else {
                query[key] = this.validateQuery(key, value);
            }
        });
    };

    schema.statics.getAggregateQuery = function(query) {
        const groupBy = [].concat(query.groupBy || []);
        delete query.groupBy;

        const sortBy = query.sortBy;
        delete query.sortBy;

        const limitBy = query.limitBy;
        delete query.limitBy;

        const aggregate = [].concat(query.aggregate || []);
        delete query.aggregate;

        this.normalizeQuery(query);

        const groupQuery = { _id: groupBy.length ? {} : null };
        const projectQuery = { '_id': 0 };

        groupBy.forEach(key => {
            groupQuery._id[key] = `$${key}`;
            projectQuery[key] = '$_id.' + key;
        });

        aggregate.forEach(operation => {
            if (operation === 'count') {
                groupQuery.count = { $sum: 1 };
                projectQuery.count = 1;
            } else {
                const t = operation.split(':');
                groupQuery[t[1]] = { [`$${t[0]}`]: `$${t[1]}` };
                projectQuery[t[1]] = 1;
            }
        });

        const aggregateQuery = [
            { $match: query },
            { $group: groupQuery },
            { $project: projectQuery }
        ];

        if (sortBy) {
            aggregateQuery.push({ $sort: sortBy });
        }

        if (limitBy) {
            aggregateQuery.push({ $limit: limitBy });
        }

        return aggregateQuery;
    };

    schema.statics.process = function(data) {
        return data;
    };

    // Database writes
    schema.statics.add = function(...args) {
        const data = [].concat(args[0]);
        let rawData = args[1] || false;
        let callback = args[2] || noop;

        if (typeof rawData === 'function') {
            callback = rawData;
            rawData = false;
        }

        const promisifiedCallback = new PromisifiedCallback(callback);
        callback = promisifiedCallback.callback;

        const results = [];
        const create = entries => {
            const record = entries.shift();
            this.validateQuery(record);
            this.create(record, passError(callback, result => {
                results.push(result);
                if (entries.length) {
                    create(entries);
                } else {
                    callback(null, results.map(r => r ? (rawData ? r : this.process(r)) : r));
                }
            }));
        };

        if (data.length) {
            create(data);
        } else {
            callback();
        }
        return promisifiedCallback.promise;
    };

    schema.statics.update = function(...args) {
        const data = [].concat(args[0]);
        let rawData = args[1] || false;
        let callback = args[2] || noop;

        if (typeof rawData === 'function') {
            callback = rawData;
            rawData = false;
        }

        const promisifiedCallback = new PromisifiedCallback(callback);
        callback = promisifiedCallback.callback;

        const results = [];
        const update = entries => {
            const record = entries.shift();
            this.validateQuery(record);

            const query = record._id ? { _id: record._id } : this.getQuery(record);
            this.findOneAndUpdate(query, record, { upsert: true }, passError(callback, result => {
                results.push(result);
                if (entries.length) {
                    update(entries);
                } else {
                    callback(null, results.map(r => r ? (rawData ? r : this.process(r)) : r));
                }
            }));
        };

        if (data.length) {
            update(data);
        } else {
            callback();
        }

        return promisifiedCallback.promise;
    };

    schema.statics.set = function(query, update, ...args) {
        const callback = args[0] || noop;
        const updater = typeof update === 'function' ? update : d => { extend(d, update); };

        return (
            this.get(query, true).then(results => {
                return results.map(record => {
                    const output = getSubset(record, this.keys);
                    output._id = record._id;
                    return updater(output) || output;
                });
            }).then(records => {
                return this.update(records, callback);
            })
        );
    };

    schema.statics.delete = function(...args) {
        const query = args[0];
        let callback = args[1] || noop;

        const promisifiedCallback = new PromisifiedCallback(callback);
        callback = promisifiedCallback.callback;

        if (query.constructor === Array) {
            Promise.all(query.map(q => {
                return this.delete(q);
            })).then(() => {
                callback();
            }).catch(callback);
        } else {
            this.normalizeQuery(query);
            this.find(query, passError(callback, records => {
                records.forEach(record => record.remove());
                callback();
            }));
        }

        return promisifiedCallback.promise;
    };

    // Database reads
    schema.statics.getCount = function(...args) {
        const query = args[0];
        let callback = args[1] || noop;

        const promisifiedCallback = new PromisifiedCallback(callback);
        callback = promisifiedCallback.callback;

        this.normalizeQuery(query);
        this.count(query, passError(callback, count => {
            callback(null, count);
        }));

        return promisifiedCallback.promise;
    };

    schema.statics.get = function(...args) {
        const query = args[0];
        let rawData = args[1] || false;
        let extra = args[2] || {};
        let callback = args[3] || noop;

        if (typeof rawData === 'function') {
            callback = rawData;
            rawData = false;
        }
        if (typeof rawData === 'object') {
            extra = rawData;
            rawData = false;
        }
        if (typeof extra === 'function') {
            callback = extra;
            extra = {};
        }

        const fields = extra.fields || {};
        delete extra.fields;
        const options = extra = extra.options || extra;

        const promisifiedCallback = new PromisifiedCallback(callback);
        callback = promisifiedCallback.callback;

        this.normalizeQuery(query);
        this.find(query, fields, options, passError(callback, records => {
            callback(null, records.map(r => r ? (rawData ? r : this.process(r)) : r));
        }));

        return promisifiedCallback.promise;
    };

    schema.statics.stream = function(...args) {
        const query = args[0];
        let rawData = args[1] || false;
        let extra = args[2] || {};
        let callback = args[3] || noop;

        if (typeof rawData === 'function') {
            callback = rawData;
            rawData = false;
        }
        if (typeof rawData === 'object') {
            extra = rawData;
            rawData = false;
        }
        if (typeof extra === 'function') {
            callback = extra;
            extra = {};
        }

        const fields = extra.fields || {};
        delete extra.fields;
        const options = extra = extra.options || extra;

        this.normalizeQuery(query);
        const cursor = this.find(query, fields, options).cursor();

        const processStream = () => (
            cursor.next().then(record => {
                if (record) {
                    const breakHere = callback(rawData ? record : this.process(record));

                    if (!breakHere) {
                        return processStream();
                    }

                    return Promise.resolve(breakHere);
                }

                return Promise.resolve();
            })
        );

        return processStream();
    };

    schema.statics.getAggregate = function(...args) {
        const query = args[0];
        let rawData = args[1] || false;
        let callback = args[2] || noop;
        if (typeof rawData === 'function') {
            callback = rawData;
            rawData = false;
        }

        const promisifiedCallback = new PromisifiedCallback(callback);
        callback = promisifiedCallback.callback;

        const aggregateQuery = this.getAggregateQuery(query);
        connection.then(() => {
            this.collection.aggregate(aggregateQuery, passError(callback, cursor => {
                cursor.toArray().then(records => {
                    callback(null, records.map(r => r ? (rawData ? r : this.process(r)) : r));
                });
            }));
        });

        return promisifiedCallback.promise;
    };

    schema.statics.keys = [];
    schema.eachPath(key => {
        if (!/^_/.test(key)) {
            schema.statics.keys.push(key);
        }
    });

    return schema;
};
