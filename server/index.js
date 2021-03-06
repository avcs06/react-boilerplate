require('ignore-styles');
require('module-alias/register');
require('babel-register')({
    plugins: ['#root/.babel/handleLoadableServer']
});

const path = require('path');
const logger = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const Loadable = require('react-loadable');

const SSR = require('@lib/SSR');
const apiHandlers = require('./handlers/api');

const config = require('#config');
const { setPort } = require('#common/get');
setPort(config.port);

// Initialize routing
const app = express();
app.use(compression());
app.use(logger('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Handle static files
app.use('/static', express.static(
    path.join(__dirname, '../dist/assets'),
    { immutable: true, maxAge: '1y' }
));

// Handle API requests
app.use('/api', apiHandlers());

// Handle Pages
app.use(SSR);

// Handle errors
app.use((err, req, res) => {
    console.log(err.stack ? err.stack : err);
    res.status(err.status || 500);
    res.send({ message: err.message || err });
});

// Start sever
Loadable.preloadAll().then(() => {
    app.listen(config.port, () => console.log('Express server listening on port ' + config.port));
});
