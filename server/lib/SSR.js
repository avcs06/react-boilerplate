
const fs = require('fs');
const path = require('path');

const React = require('react');
const { renderToString, renderToStaticMarkup } = require('react-dom/server');
const { configureStore } = require('../../app/store/configureStore');
const Session = require('./Session');
const App = require('../App');

module.exports = (req, res) => {
    const session = new Session();
    const context = { session, meta: [] };
    const store = configureStore();

    const getProcessedHtml = (context) => (
        renderToString(React.createElement(App, { req, store, context }))
    );

    // Call once to initialize the api calls
    getProcessedHtml(context);

    // If there is any redirect
    if (context.url) {
        res.writeHead(301, {
            Location: context.url
        });
        res.end();
    } else {
        if (context.code) {
            res.status(context.code);
        }

        // Once all the api calls are made and data is available
        session.done(() => {
            const html = getProcessedHtml({});
            const metaTags = context.meta.map(e => renderToStaticMarkup(e)).join('');

            fs.readFile(path.join(__dirname, '../../dist/index.html'), 'utf8', (err, data) => {
                if (err) {
                    throw err;
                }

                res.write(
                    data
                    .replace('<!--META-TAGS-->', metaTags)
                    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
                    .replace('{STATE_NOT_LOADED:true}', JSON.stringify(
                        new Buffer(JSON.stringify(store.getState())).toString('base64')
                    ))
                );
                res.end();
            });
        });
    }
};
