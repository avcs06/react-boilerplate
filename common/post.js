const fetch = require('./fetch');

module.exports = (...args) => {
    const url = args[0];
    let data = args[1];
    let successCallback = args[2] || Function.prototype;
    let errorCallback = args[3] || (err => { throw err; });

    if (typeof data === 'function') {
        successCallback = data;
        errorCallback = successCallback;
        data = null;
    }

    return (
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data || {})
        })
            .then(response => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                }

                const error = new Error(response.statusText);
                error.response = response;
                throw error;
            })
            .then(response => {
                successCallback(response);
                return response;
            })
            .catch(errorCallback)
    );
};
