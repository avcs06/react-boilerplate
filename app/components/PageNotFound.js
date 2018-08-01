// @loadable

import React, { Fragment, Component } from 'react';
import { Helmet } from 'react-helmet';

class PageNotFound extends Component {
    componentWillMount() {
        const { staticContext } = this.props;
        if (staticContext) {
            staticContext.code = 404;
        }
    }

    render() {
        return (
            <Fragment>
                <Helmet>
                    <title>Page Not Found</title>
                    <meta name="description" content="Page Not Found" />
                </Helmet>
                <div> 404, Page Not Found </div>
            </Fragment>
        );
    }
}

export default PageNotFound;
