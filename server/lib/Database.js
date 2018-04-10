const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;

let setupDatabase;
const connectionPromise = new Promise((resolve, reject) => {
    setupDatabase = database => {
        // Initialize Database
        mongoose.connect(database, {
            autoIndex: false,
            keepAlive: 360000,
            connectTimeoutMS: 360000,
        });

        const Database = mongoose.connection;

        Database.once('open', () => {
            resolve(Database);
        });
        Database.on('error', err => {
            console.error('connection error:', err);
            reject(err);
        });
    };
});

connectionPromise.ready = connectionPromise.then;

module.exports = connectionPromise;
module.exports.setupDatabase = setupDatabase;
