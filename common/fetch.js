const fetch = require('isomorphic-fetch');
const Promise = require('bluebird');
const context = global || window;

module.exports = (...args) => Promise.resolve(fetch.apply(context, args));
