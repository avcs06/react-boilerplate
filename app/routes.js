import React from 'react';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import App from './containers/App';

export default (
    <Switch>
    	<Route path="/" component={App} />
    </Switch>
);
