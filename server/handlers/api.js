const express = require('express');

const DAL = require('../DAL');
const HttpError = require('../lib/HttpError');
const capitalize = str => str.slice(0, 1).toUpperCase() + str.slice(1);

module.exports = () => {
    const app = express();

    app.use('/:model', (req, res, next) => {
        res.locals.model = DAL[req.params.model];
        next();
    });

    app.get('/:model/get/:index', (req, res, next) => {
        const query = req.query;
        const method = 'get' + capitalize(req.params.index);

        res.locals.model[method](query, (err, data) => {
            if (err) return next(err);
            return res.send({ data });
        });
    });

    app.get('/:model/get', (req, res, next) => {
        res.locals.model.get(req.query, (err, data) => {
            if (err) return next(err);
            return res.send({ data });
        });
    });

    app.use('*', (req, res, next) => {
        next(new HttpError('InvalidAPI', 400));
    });

    return app;
};
