import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from '../reducers';

export function configureStore(initialState = {}, history) {
    const middlewares = [thunkMiddleware];
    history && middlewares.push(routerMiddleware(history));
    return createStore(rootReducer, initialState, applyMiddleware(...middlewares));
}
