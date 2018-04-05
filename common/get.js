import fetch from './fetch';
import QueryString from 'query-string';

const cache = {};

export default (...args) => {
    const url = args[0];
    let data = args[1];
    let successCallback = args[2] || Function.prototype;
    let errorCallback = args[3] || (err => { throw err; });

    if (typeof data === 'function') {
        successCallback = data;
        errorCallback = successCallback;
        data = null;
    }

    const query = QueryString.stringify(data || {});
    const requestUrl = url + '?' + query;

    if (typeof cache[requestUrl] === 'undefined') {
        cache[requestUrl] = (
            fetch(requestUrl)
            .then(response => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                }

                const error = new Error(response.statusText);
                error.response = response;
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
