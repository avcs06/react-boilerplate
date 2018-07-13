const React = require('react');
const { Provider } = require('react-redux');
const { StaticRouter } = require('react-router');
const routes = require('#app/routes').default;

module.exports = ({ req, store, context }) => (
    <Provider store={store}>
        <StaticRouter location={req.url} context={context}>
            {routes}
        </StaticRouter>
    </Provider>
);
