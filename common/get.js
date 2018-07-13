const fetch = require('./fetch');
const QueryString = require('query-string');

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';
const cache = {};

let makeRequest;
let port;
if (isBrowser) {
    makeRequest = fetch;
} else if (isNode) {
    makeRequest = requestUrl => {
        const isRelative = /^\/[^/]+/.test(requestUrl) || requestUrl === '/';

        if (isRelative) {
            return fetch(`http://localhost:${port}${requestUrl}`);
        }

        return fetch(requestUrl);
    };
}

module.exports = (...args) => {
    const url = args[0];
    let data = args[1];
    let successCallback = args[2] || Function.prototype;
    let errorCallback = args[3] || (err => { throw err; });
    let force = args[4] || false;

    if (typeof data === 'boolean') {
        force = data;
        data = null;
    }

    if (typeof errorCallback === 'boolean') {
        force = errorCallback;
        errorCallback = err => { throw err; };
    }

    if (typeof successCallback === 'boolean') {
        force = successCallback;
        successCallback = Function.prototype;
    }

    if (typeof data === 'function') {
        successCallback = data;
        errorCallback = successCallback;
        data = null;
    }

    if (force) {
        data = data || {};
        data._v = Date.now();
    }

    const query = QueryString.stringify(data || {});
    const requestUrl = url + '?' + query;

    if (typeof cache[requestUrl] === 'undefined') {
        cache[requestUrl] = (
            makeRequest(requestUrl)
                .then(response => {
                    if (response.status >= 200 && response.status < 300) {
                        return response.json();
                    }

                    const error = new Error(response.statusText);
                    error.response = response.json();
                    throw error;
                })
        );
    }

    return (
        cache[requestUrl]
            .then(response => {
                successCallback(response);
                return response;
            })
            .catch(errorCallback)
    );
};

module.exports.setPort = p => {
    port = p;
};
