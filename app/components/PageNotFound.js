import React from 'react';
import Component from '../lib/Component';

class PageNotFound extends Component {
    componentWillMount() {
        super.componentWillMount();
        const { staticContext } = this.props;
        if (staticContext) {
            staticContext.code = 404;
        }
    }

    getMetaData() {
        return {
            'title': 'Page Not Found',
            'meta:description': 'Page Not Found'
        };
    }

    render() {
        return (
            <div> 404, Page Not Found </div>
        );
    }
}

export default PageNotFound.getComponent();
