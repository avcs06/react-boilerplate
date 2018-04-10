import 'babel-polyfill';
import React from 'react';
import createHistory from 'history/createBrowserHistory';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';

import './styles/main.scss';
import routes from './routes';
import { configureStore } from './store/configureStore';

const history = createHistory();
const store = configureStore(JSON.parse(window.atob(window.__PRELOADED_STATE__)), history);

render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            {routes}
        </ConnectedRouter>
    </Provider>,
    document.getElementById('root')
);
