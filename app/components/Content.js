import React, { Component } from 'react';
import getLoadableComponent from '$lib/getLoadableComponent';

const views = {
    home: getLoadableComponent('./Home'),
    pageNotFound: getLoadableComponent('./PageNotFound')
};

class Content extends Component {
    render() {
        const route = this.props.match.params.route || 'home';
        const View = views[route] || views.pageNotFound;

        return <View />;
    }
}

export default Content;
