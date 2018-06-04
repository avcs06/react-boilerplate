
const fs = require('fs');
const path = require('path');

const React = require('react');
const Loadable = require('react-loadable');
const { getBundles } = require('react-loadable/webpack');
const stats = JSON.parse(fs.readFileSync(path.join(__dirname, '../../dist/assets/react-loadable.json'), 'utf8'));

const { renderToString } = require('react-dom/server');
const { configureStore } = require('../../app/store/configureStore');
const Session = require('./Session');
const App = require('../App');

const metaInfo = {
    title: {
        name: 'id'
    },
    link: {
        name: 'rel',
        content: 'href'
    },
    meta: {
        name: 'name',
        content: 'content'
    }
};

const generateMetaTags = metaData => (
    Object.keys(metaData).map(key => {
        const [tag, ...names] = key.split(':');
        const name = names.join(':') || 'title';
        const info = metaInfo[tag];
        return (
            `<${tag} ${info.name}="${name}" ${(info.content && `${info.content}="${metaData[key]}" />`) || `>${metaData[key]}</${tag}>`}`
        );
    }).join('')
);

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

            const metaTags = generateMetaTags(context.meta);
            const bundles = getBundles(stats, context.modules);

            const styles = (
                bundles.filter(bundle => bundle.file.endsWith('.css'))
                    .map(style => `<link href="${style.publicPath}" rel="stylesheet" />`)
                    .join('')
            );

            const scripts = (
                bundles.filter(bundle => bundle.file.endsWith('.js'))
                    .map(script => `<script type="text/javascript" src="${script.publicPath}"></script>`)
                    .join('')
            );

            fs.readFile(path.join(__dirname, '../../dist/index.html'), 'utf8', (err, data) => {
                if (err) {
                    throw err;
                }

                res.write(
                    data
                        .replace('<!--META-TAGS-->', metaTags)
                        .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
                        .replace('</head>', styles + '</head>')
                        .replace('</body>', scripts + '</body>')
                        .replace('{STATE_NOT_LOADED:true}', JSON.stringify(new Buffer(JSON.stringify(store.getState())).toString('base64')))
                );
                res.end();
            });
        });
    }
};
