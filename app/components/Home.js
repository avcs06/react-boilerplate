import '$styles/home.scss';
import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { ImmutablePureComponent } from '$lib/ImmutablePureComponent';

import get from '#common/get';
import async from '$lib/async';
import Promise from 'bluebird';

class Home extends ImmutablePureComponent {
    render() {
        // Here this.props.fetchApi is also available, which can be called any time to refetch the api
        // First parameter passed to this.props.fetchApi will be available in the first parameter of asyncHandler
        // This can be used to change api requests. Example: applying filters
        const { api } = this.props;
        const sampleData = api.get('sampleData');

        return (
            <Fragment>
                <Helmet>
                    <title>Home Page</title>
                    <meta name="description" content="Home Page Description" />
                </Helmet>
                <div> Home Page (data: {sampleData.get('sample')}) </div>
            </Fragment>
        );
    }
}

const asyncHandler = (/* filters */) => (
    Promise.props({
        sampleData: get('/static/sample.json', true)
    })
);

const defaults = {
    sampleData: {}
};

export default async(Home, asyncHandler, defaults);
