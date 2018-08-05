
const fs = require('fs');
const path = require('path');

const React = require('react');
const { Helmet } = require('react-helmet');
const Loadable = require('react-loadable');
const { getBundles } = require('react-loadable/webpack');

const { renderToString } = require('react-dom/server');
const { configureStore } = require('#app/store/configureStore');
const Session = require('./Session');
const App = require('#server/App');

const distFolderPath = '../../dist/';
const stats = require('#dist/assets/react-loadable.json');

module.exports = (req, res) => {
    const session = new Session();
    const context = { session, meta: {}, modules: [] };
    const store = configureStore();

    // Call once to initialize the api calls
    renderToString(<App req={req} store={store} context={context} />);

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
            const html = renderToString(
                <Loadable.Capture report={m => context.modules.push(m)}>
                    <App req={req} store={store} context={context} />
                </Loadable.Capture>
            );

            const helmet = Helmet.renderStatic();
            const metaTags = ['title', 'meta', 'link'].reduce((a, type) => a + helmet[type].toString(), '');
            const customStyles = helmet.style.toString();

            const bundles = getBundles(stats, context.modules.filter(m => !/^!/.test(m)));

            let styles = '';
            bundles.filter(bundle => bundle.file.endsWith('.css'))
                .forEach(style => {
                    styles += `
                    <style data-href="${style.publicPath}">
                        ${fs.readFileSync(path.join(__dirname, distFolderPath, 'assets/', style.file), 'utf-8')}
                    </style>`;
                });

            const scripts = (
                bundles.filter(bundle => bundle.file.endsWith('.js'))
                    .map(script => `<script type="text/javascript" src="${script.publicPath}"></script>`)
                    .join('')
            );

            fs.readFile(path.join(__dirname, distFolderPath, 'index.html'), 'utf8', (err, data) => {
                if (err) {
                    throw err;
                }

                res.set('Content-Type', 'text/html');
                res.write(
                    data
                        .replace('<html>', `<html ${helmet.htmlAttributes.toString()}>`)
                        .replace('</head>', metaTags + '</head>')
                        .replace('</head>', styles + '</head>')
                        .replace('</head>', customStyles + '</head>')
                        .replace('<body>', `<body ${helmet.bodyAttributes.toString()}>`)
                        .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
                        .replace('{STATE_NOT_LOADED:true}', JSON.stringify(new Buffer(JSON.stringify(store.getState())).toString('base64')))
                        .replace('</body>', scripts + '</body>')
                );
                res.end();
            });
        });
    }
};
