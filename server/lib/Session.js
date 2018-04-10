const Promise = require('bluebird');

module.exports = (
    class Session {
        constructor() {
            this.apis = [];
        }

        track(...args) {
            Array.prototype.push.apply(this.apis, args);
        }

        done(cb) {
            return Promise.all(this.apis).then(cb || Function.prototype);
        }
    }
);
