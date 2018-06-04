import '../styles/home.scss';
import React from 'react';
import Component from '../lib/Component';

class Home extends Component {
    getMetaData() {
        return {
            'title': 'Page Title',
            'meta:description': 'Page Description',
            // format: 'tag:[rel|name]': '[href|content]'
            // 'meta:shortcut icon' and 'meta:og:title' are valid entries
        };
    }

    render() {
        return (
            <div> Home Page </div>
        );
    }
}

export default Home.getComponent();
