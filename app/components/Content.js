import React, { Component } from 'react';
import PageNotFound from 'PageNotFound';

class Content extends Component {
    render() {
        const { match: { params: { route }}} = this.props;

        // Empty or null route => Home page
        const View = 'Do some routing here and get the View for current route';

        if (!View) {
            View = PageNotFound;
        }

        return <View />;
    }
}

export default Content;
