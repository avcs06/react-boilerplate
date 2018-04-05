const express = require('express');
const HttpError = require('../lib/HttpError');
// const DAL = require('../DAL');

module.exports = () => {
    const app = express();

    app.use('/*', (req, res, next) => {
        next(new HttpError('InvalidAPI', 400));
    });

    return app;
};
