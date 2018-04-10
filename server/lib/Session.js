const Promise = require('bluebird');

module.exports = (
    class Session {
        constructor() {
            this.apis = [];
        }

        track(...args) {
            this.apis = Array.prototype.concat.apply(this.apis, args);
        }

        done(cb) {
            Promise.all(this.apis).then(cb || Function.prototype);
        }
    }
);
