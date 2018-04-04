import fetch from 'isomorphic-fetch';
import Promise from 'bluebird';

const context = global || window;
export default (...args) => Promise.resolve(fetch.apply(context, args));
