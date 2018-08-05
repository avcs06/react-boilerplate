import React from 'react';
import Loadable from 'react-loadable';
import createHistory from 'history/es/createBrowserHistory';

import { hydrate } from 'react-dom';
import Provider from 'react-redux/lib/components/Provider';
import Router from 'react-router/Router';

import './styles/main.scss';
import routes from './routes';
import { configureStore } from './store/configureStore';

let preloadedState = {};
if (!window.__PRELOADED_STATE__.STATE_NOT_LOADED) {
    preloadedState = JSON.parse(window.atob(window.__PRELOADED_STATE__));
}
delete window.__PRELOADED_STATE__;

const history = createHistory();
const store = configureStore(preloadedState, history);

Loadable.preloadReady().then(() => (
    hydrate(
        <Provider store={store}>
            <Router history={history}>
                {routes}
            </Router>
        </Provider>,
        document.getElementById('root')
    )
));
