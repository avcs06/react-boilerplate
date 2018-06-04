import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from '../reducers';

export function configureStore(initialState = {}, history) {
    const middlewares = [thunkMiddleware];
    history && middlewares.push(routerMiddleware(history));
    return createStore(rootReducer, initialState, applyMiddleware(...middlewares));
}

// I believe store should always be accessed from react-redux connect, if you want to access it externally
// You can create a variable, assign the output of createStore to the variable inside configureStore and export it.
