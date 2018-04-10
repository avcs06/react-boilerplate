import React, { Component } from 'react';

class PageNotFound extends Component {
    componentWillMount() {
        const { staticContext } = this.props;
        if (staticContext) {
            staticContext.code = 404;
        }
    }

    render() {
        return (
            <div> 404, Page Not Found </div>
        );
    }
}

export default PageNotFound;
