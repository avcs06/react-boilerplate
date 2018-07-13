import thunkMiddleware from 'redux-thunk';
import routerMiddleware from 'react-router-redux/lib/middleware';
import { applyMiddleware, createStore } from 'redux';

import rootReducer from '../reducers';

export const configureStore = (initialState = {}, history) => (
    createStore(
        rootReducer,
        initialState,
        applyMiddleware(thunkMiddleware, ...(history ? [routerMiddleware(history)] : []))
    )
);
