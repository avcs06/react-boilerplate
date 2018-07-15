import React, { Component } from 'react';
import Home from './Home';
import PageNotFound from './PageNotFound';

const views = {
    home: Home,
    pageNotFound: PageNotFound
};

class Content extends Component {
    render() {
        const route = this.props.match.params.route || 'home';
        const View = views[route] || views.pageNotFound;

        return <View />;
    }
}

export default Content;
