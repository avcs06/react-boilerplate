import express from 'express';
import DAL from '../DAL';
import HttpError from '../lib/HttpError';

export default () => {
    const app = express();

    app.use('/*', (req, res, next) => {
        next(new HttpError('InvalidAPI', 400));
    });

    return app;
};
