import React, { Component } from 'react';
import PageNotFound from './PageNotFound';
import Home from '../containers/Home';

const Views = {
    home: Home
};

class Content extends Component {
    render() {
        const { match: { params: { route }}} = this.props;

        // Empty or null route => Home page
        // Do some routing here and get the View for current route
        let View = !route ? Home : Views[route];
        if (!View) {
            View = PageNotFound;
        }

        return <View />;
    }
}

export default Content;
