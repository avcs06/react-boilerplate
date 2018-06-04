import extend from 'extend';
import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';
import { API_REQUEST } from '../actions';

const apiReducer = (state = {}, action) => {
    if (action.type === API_REQUEST) {
        let stateUpdate = action.response;

        if (action.base) {
            stateUpdate = { [action.base]: stateUpdate };
        }

        return extend(true, {}, state, stateUpdate);
    }
    return state;
};

const rootReducer = combineReducers({ routing: routerReducer, api: apiReducer });

export default rootReducer;
