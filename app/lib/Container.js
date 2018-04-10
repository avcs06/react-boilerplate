import extend from 'extend';
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { getApiRequestAction } from '../actions';

const ignore = ['dispatch', 'api', 'match', 'history', 'location', 'staticContext'];

class Container extends Component {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        api: PropTypes.object,
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
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

    static fetchApis(state, dispatch, context) {
        if (this.api) {
            dispatch(getApiRequestAction({
                state,
                api: this.api,
                base: this.base,
                session: context ? context.session : null
            }));
        }
    }

    static get container() {
        return withRouter(connect(this.getStateToPropsMap())(this));
    }

    componentWillMount() {
        const { dispatch, staticContext, api } = this.props;
        this.constructor.fetchApis(api, dispatch, staticContext);
    }

    render() {
        const props = {};

        Object.keys(this.props).forEach(key => {
            if (!ignore.includes(key)) {
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
