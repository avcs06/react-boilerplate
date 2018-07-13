import React from 'react';
import { is } from 'immutable';

export class ImmutablePureComponent extends React.Component {
    shouldComponentUpdate(nextProps, nextState = {}) {
        const state = this.state || {};

        return !(this.updateOnProps || Object.keys({ ...nextProps, ...this.props })).every((p) => is(nextProps[p], this.props[p]))
            || !(this.updateOnStates || Object.keys({ ...nextState, ...state })).every((s) => is(nextState[s], state[s]));
    }
}

export default ImmutablePureComponent;
