const express = require('express');
const HttpError = require('@lib/HttpError');

module.exports = () => {
    const app = express();

    app.use('*', (req, res, next) => {
        next(new HttpError('InvalidAPI', 400));
    });

    return app;
};
