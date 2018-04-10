import extend from 'extend';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { getApiRequestAction } from '../actions';

class Container extends Component {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        api: PropTypes.object
    };

    static getStateToPropsMap(extra) {
        const map = extra || {};
        return (state, ownProps) => {
            const stateSection = (this.base ? state.api[this.base] : state.api) || {};

            Object.keys(ownProps).forEach(prop => {
                map[prop] = ownProps[prop];
            });

            if (this.api) {
                map.api = extend({}, stateSection);
            }

            return map;
        };
    }

    componentWillMount() {
        const { dispatch, staticContext  } = this.props;
        if (this.constructor.api) {
            const { api: stateApi } = this.props;
            dispatch(getApiRequestAction({
                api: this.constructor.api,
                state: stateApi,
                base: this.constructor.base,
                session: staticContext ? staticContext.session : null
            }));
        }
    }

    render() {
        const props = {};

        Object.keys(this.props).forEach(key => {
            if (key !== 'dispatch' && key !== 'api') {
                props[key] = this.props[key];
            }
        });

        Object.keys(this.constructor.api || {}).forEach(key => {
            if (this.props.api.hasOwnProperty(key)) {
                props[key] = this.props.api[key];
            }
        });

        Object.keys(this.constructor.defaults || {}).forEach(key => {
            if (!props.hasOwnProperty(key)) {
                props[key] = this.constructor.defaults[key];
            }
        });

        return React.createElement(this.constructor.component, props);
    }
}

export default Container;
