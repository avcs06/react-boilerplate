require('babel-register')();

const React = require('react');
const { renderToString } = require('react-dom/server');
const { configureStore } = require('../app/store/configureStore');
const App = require('./App');

const fs = require('fs');
const path = require('path');

const logger = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');

const apiHandlers = require('./handlers/api');
const sessionApis = require('../app/lib/session').default;
const config = require('../config').default;

/* const { setupDatabase } = require('./lib/database');
setupDatabase('database_address'); */

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

    const getProcessedHtml = () => (
        renderToString(React.createElement(App, { req, store, context }))
    );

    // Call once to initialize the api calls
    getProcessedHtml();
    // Once all the api calls are made and data is available
    sessionApis.done().then(() => {
        const html = getProcessedHtml();

        if (context.url) {
            res.writeHead(301, {
                Location: context.url
            });
            res.end();
        } else {
            fs.readFile(path.join(__dirname, '../dist/index.html'), 'utf8', (err, data) => {
                if (err) throw err;
                let document = data.replace(/<div id="root"><\/div>/, `<div id="root">${html}</div>`);
                document = document.replace('{STATE_NOT_LOADED:true}', JSON.stringify(store.getState()).replace(/</g, '\\u003c'));

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
const port = config.port || process.env.PORT;
app.listen(port, () => console.log('Express server listening on port ' + port));
