import React from 'react';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';

import Header from '$components/Header';
import Content from '$components/Content';

export default () => (
    <div className="root">
        <Header />
        <Switch>
            <Route exact path="/" component={Content} />
            <Route path="/:route" component={Content} />
        </Switch>
    </div>
);
