import React, { Component } from 'react';
import getLoadableComponent from '$lib/getLoadableComponent';
import Home from './Home';

const views = {
    home: Home,
    pageNotFound: getLoadableComponent('./PageNotFound', { timeout: 3000 })
};

class Content extends Component {
    render() {
        const route = this.props.match.params.route || 'home';
        const View = views[route] || views.pageNotFound;

        return <View />;
    }
}

export default Content;
