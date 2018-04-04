import extend from 'extend';
import Promise from 'bluebird';
import passError from 'passerror';
import { Schema } from 'mongoose';
import 'mongoose-relationship';
import connection from '../lib/database';

const noop = Function.prototype;

class PromisifiedCallback {
    constructor(callback) {
        this.promise = new Promise((resolve, reject) => {
            this.callback = (err, result) => {
                callback(err, result || null);
                if(err) return reject(err);
                return resolve(result);
            };
        });
    }
}

module.exports = (options) => {
    const schemaOptions = options.schema;
    const unique = [].concat(options.unique);

    //  handle unique key
    unique.forEach(u => {
        if(typeof schemaOptions[u].type === 'undefined') {
            schemaOptions[u] = { type: schemaOptions[u] };
        }
        extend(schemaOptions[u], { index: true, unique: true });
    });

    const schema = new Schema(schemaOptions);


    // Query manipulations
    schema.statics.validateQuery = function(key, value) {
        let query;
        let isKeyValuePair = false;

        if(typeof key === 'object') {
            query = key;
        } else {
            query = {[key]: value};
            isKeyValuePair = true;
        }

        Object.keys(query).forEach(k => {
            if(schemaOptions[k]) {
                const schemaType = (schemaOptions[k].type || schemaOptions[k]);
                const value = query[k];
                if(schemaType === Date) {
                    query[k] = new Date(value);
                    if(isNaN(query[k].getTime())) {
                        throw new Error(`Invalid Date (${JSON.stringify(value)}) passed for: ${k}`);
                    }
                } else if (schemaType === Number) {
                    if(!isNaN(value)) {
                        query[k] = Number(value);
                    } else {
                        throw new Error(`Invalid Number (${JSON.stringify(value)}) passed for: ${k}`);
                    }
                } else {
                    if(typeof value === 'string') {
                        try {
                            query[k] = JSON.parse(value);
                        } catch(e) {
                            if(schemaType !== String && schemaType !== Schema.Types.Mixed) {
                                throw new Error(`Invalid value (${JSON.stringify(value)}) passed for: ${k}`);
                            }
                        }
                    }
                }
            }
        });

        return isKeyValuePair ? query[key] : query;
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
            if(value === null) {
                query[key] = value;
            } else if(typeof value === 'object' && value.constructor === Array) {
                const gtValue = this.validateQuery(key, value[0]);
                const ltValue = this.validateQuery(key, value[1]);
                query[key] = { $gte: gtValue, $lte: ltValue };
            } else if(/^</.test(value)) {
                value = this.validateQuery(key, value.slice(1));
                query[key] = { $lt: value };
            } else if(/^>/.test(value)) {
                value = this.validateQuery(key, value.slice(1));
                query[key] = { $gt: value };
            } else {
                query[key] = this.validateQuery(key, value);
            }
        });
    };

    schema.statics.process = function(data) { return data; };

    schema.statics.get = function(...args) {
        const query = args[0];
        let rawData = args[1] || false;
        let options = args[2] || {};
        let callback = args[3] || noop;
        if(typeof rawData === 'function') {
            callback = rawData;
            rawData = false;
        }
        if(typeof rawData === 'object') {
            options = rawData;
            rawData = false;
        }
        if(typeof options === 'function') {
            callback = options;
            options = {};
        }


        const promisifiedCallback = new PromisifiedCallback(callback);
        callback = promisifiedCallback.callback;

        if(typeof query === 'object' && query.constructor !== Array) {
            this.normalizeQuery(query);
            this.find(query, {}, options, passError(callback, records => {
                callback(null, records.map(r => r ? (rawData ? r : this.process(r)) : r));
            }));
        } else {
            const queryFromArray = this.getQuery([].concat(query));
            this.findOne(queryFromArray, {}, options, passError(callback, record => {
                callback(null, record ? (rawData ? record : this.process(record)) : record);
            }));
        }

        return promisifiedCallback.promise;
    };

    schema.statics.validateData = function(...args) {
        const data = [].concat(args[0]);
        let callback = args[1] || noop;

        const promisifiedCallback = new PromisifiedCallback(callback);
        callback = promisifiedCallback.callback;

        Promise.all(
            data.map(record => {
                return new Promise((resolve, reject) => {
                    new this(record).validate(err => {
                        if(err) {
                            const query = this.getQuery(record);
                            return reject(new Error(`Unable to save record with ${JSON.stringify(query)}. ${err.message} `));
                        }
                        try {
                            this.validateQuery(record);
                        } catch(e) {
                            return reject(e);
                        }
                        return resolve();
                    });
                });
            })
        )
        .then(() => {
            callback();
        })
        .catch(e => {
            callback(e);
        });

        return promisifiedCallback.promise;
    };

    schema.statics.set = function(data, callback = noop) {
        return (
            this.validateData(data).then(() => {
                return this.setWithoutValidation(data, callback);
            })
        );
    };

    schema.statics.setWithoutValidation = function(...args) {
        const data = [].concat(args[0]);
        let callback = args[1] || noop;

        const promisifiedCallback = new PromisifiedCallback(callback);
        callback = promisifiedCallback.callback;

        if(data.length) {
            connection.then(() => {
                const bulk = this.collection.initializeUnorderedBulkOp();
                data.forEach(record => {
                    const query = this.getQuery(record);
                    bulk.find(query).upsert().updateOne(record);
                });

                bulk.execute(passError(callback, () => {
                    callback();
                }));
            });
        } else {
            callback();
        }

        return promisifiedCallback.promise;
    };

    schema.statics.add = function(...args) {
        const data = [].concat(args[0]);
        let callback = args[1] || noop;

        const promisifiedCallback = new PromisifiedCallback(callback);
        callback = promisifiedCallback.callback;

        const results = [];
        const create = entries => {
            const entry = entries.shift();
            this.validateQuery(entry);
            this.create(entry, passError(callback, result => {
                results.push(result);
                if (entries.length) {
                    create(entries);
                } else {
                    callback(null, results);
                }
            }));
        };

        create(data);
        return promisifiedCallback.promise;
    };

    schema.statics.delete = function(...args) {
        const query = args[0];
        let callback = args[1] || noop;

        const promisifiedCallback = new PromisifiedCallback(callback);
        callback = promisifiedCallback.callback;

        if(query.constructor === Array) {
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

    return schema;
};
