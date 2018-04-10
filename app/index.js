import 'babel-polyfill';
import React from 'react';
import createHistory from 'history/createBrowserHistory';
import { hydrate } from 'react-dom';
import { Provider } from 'react-redux';
import { Router } from 'react-router';

import './styles/main.scss';
import routes from './routes';
import { configureStore } from './store/configureStore';

if(!window.__PRELOADED_STATE__.STATE_NOT_LOADED) {
    window.__PRELOADED_STATE__ = JSON.parse(window.atob(window.__PRELOADED_STATE__));
}

const history = createHistory();
const store = configureStore(window.__PRELOADED_STATE__, history);

hydrate(
    <Provider store={store}>
        <Router history={history}>
            {routes}
        </Router>
    </Provider>,
    document.getElementById('root')
);
