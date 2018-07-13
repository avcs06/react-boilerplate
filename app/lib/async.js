import { merge, mergeDeep, isImmutable, fromJS } from 'immutable';
import React, { Component } from 'react';
import connect from 'react-redux/lib/connect/connect';
import withRouter from 'react-router/withRouter';
import { API_REQUEST } from '$actions';

let baseCounter = 0;
const ignore = [
    'dispatch',
    'match',
    'history',
    'location',
    'staticContext'
];

export default (View, asyncHandler, $2) => {
    if (!asyncHandler || typeof asyncHandler !== 'function') {
        throw new Error('Missing required parameter: options.asyncHandler');
    }

    const defaults = fromJS($2 || {});
    const base = '__' + (baseCounter++);

    const mapStateToProps = (state, ownProps) => {
        const props = {};
        Object.keys(ownProps).forEach(prop => {
            props[prop] = ownProps[prop];
        });

        return merge(props, {
            api: mergeDeep(defaults, state.api[base], { __fromServer: !!state.api[base] && !isImmutable(state.api[base]) })
        });
    };

    const mapDispatchToProps = dispatch => ({
        fetchApi: (params, session) => {
            const promise = (
                asyncHandler(params)
                    .then(response => {
                        dispatch({
                            base,
                            response: fromJS(response),
                            type: API_REQUEST
                        });
                    })
            );

            session && session.track(promise);
            return promise;
        }
    });

    return withRouter(
        connect(mapStateToProps, mapDispatchToProps)(
            class extends Component {
                componentWillMount() {
                    const { fetchApi, staticContext } = this.props;
                    if (!this.props.api.get('__fromServer')) {
                        fetchApi(null, staticContext ? staticContext.session : null);
                    }
                }

                render() {
                    const props = {};
                    Object.keys(this.props).forEach(key => {
                        if (!ignore.includes(key)) {
                            props[key] = this.props[key];
                        }
                    });

                    return <View {...props} />;
                }
            }
        )
    );
};
