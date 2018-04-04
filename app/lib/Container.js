import { Component } from 'react';
import PropTypes from 'prop-types';
import { getApiRequestAction } from '../actions';

class Container extends Component {
    static getStateToPropsMap(extra) {
        const map = extra || {};
        return (state, ownProps) => {
            const stateSection = this.base ? state.api[this.base] : state.api;

            Object.keys(ownProps).forEach(prop => {
                map[prop] = ownProps[prop];
            });

            Object.keys(this.api || {}).forEach(prop => {
                map[prop] = stateSection[prop];
            });

            return map;
        };
    }

    static fetchApis(dispatch) {
        if(this.api && Object.keys(this.api).length) {
            dispatch(getApiRequestAction(this.api, this.base));
        }
    }

    componentWillMount() {
        const { dispatch } = this.props;
        this.constructor.fetchApis(dispatch);
    }
}

Container.propTypes = {
    dispatch: PropTypes.func.isRequired
};

export default Container;
