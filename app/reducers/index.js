import apiReducer from './apiReducer';
import { routerReducer } from 'react-router-redux/lib/reducer';
import { combineReducers } from 'redux';

export default combineReducers({
    api: apiReducer,
    routing: routerReducer
});
