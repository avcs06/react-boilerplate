import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';

import Header from '$components/Header';
import Content from '$components/Content';

export default () => (
    <Fragment>
        <Helmet
            titleTemplate="%s | React Boilerplate"
            defaultTitle="React Boilerplate"
        >
            <meta name="description" content="A High Performance React Boilerplate" />
        </Helmet>
        <div className="root">
            <Header />
            <Switch>
                <Route exact path="/" component={Content} />
                <Route path="/:route" component={Content} />
            </Switch>
        </div>
    </Fragment>
);
