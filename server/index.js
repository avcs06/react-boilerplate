import React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router';
import { renderToString } from 'react-dom/server';

import routes from '../app/routes';
import { configureStore } from '../app/store/configureStore';

import fs from 'fs';
import path from 'path';

import logger from 'morgan';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';

import apiHandlers from './handlers/api';
const { setupDatabase } = require('./lib/database');

import sessionApis from '../app/lib/session';

setupDatabase('database_address');

// Initialize routing
const app = express();
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Handle static files
app.use('/static', express.static(path.join(__dirname, '../dist/assets')));

// Handle API requests
app.use('/api', apiHandlers());

// Handle page requests
app.use((req, res) => {
    const context = {};
    const store = configureStore();

    renderToString(
        <Provider store={store}>
            <StaticRouter location={req.url} context={context}>
                {routes}
            </StaticRouter>
        </Provider>
    );

    sessionApis.done().then(() => {
        const html = renderToString(
            <Provider store={store}>
                <StaticRouter location={req.url} context={context}>
                    {routes}
                </StaticRouter>
            </Provider>
        );

        if (context.url) {
            res.writeHead(301, {
                Location: context.url
            });
            res.end();
        } else {
            fs.readFile(path.join(__dirname, '../dist/index.html'), 'utf8', (err, data) => {
                if (err) throw err;
                let document = data.replace(/<div id="root"><\/div>/, `<div id="root">${html}</div>`);
                document = document.replace('{{state}}', JSON.stringify(store.getState()).replace(/</g, '\\u003c'));

                res.write(document);
                res.end();
            });
        }
    });
});

// Handle errors
app.use((err, req, res) => {
    console.log(err.stack ? err.stack : err);
    res.status(err.status || 500);
    res.send({ message: err.message });
});

// Start sever
const port = process.env.PORT;
app.listen(port, () => console.log('Express server listening on port ' + port));
