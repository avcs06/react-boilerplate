import extend from 'extend';
import Promise from 'bluebird';
import get from '../../common/get';
import { noopd } from '../../common/utils';
import session from '../lib/session';

export const API_REQUEST = 'API_REQUEST';

const apiRequest = (response, base) => {
    return { type: API_REQUEST, response, base };
};

export const getApiRequestAction = (apis, base) => {
    return (dispatch) => {
        const requests = [];

        Object.keys(apis).forEach(context => {
            let api = apis[context];
            if(typeof api === 'string') {
                api = { url: api };
            }

            requests.push(
                get(api.url, api.data)
                .then(response => (
                    { [context]: (api.process || noopd)(response) }
                ))
            );
        });

        if(requests.length) {
            const actionCompletionPromise = (
                Promise.all(requests)
                .then(responses => {
                    const response = {};
                    responses.forEach(result => {
                        extend(response, result);
                    });
                    dispatch(apiRequest(response, base));
                })
                .catch(e => {  throw e; })
            );

            session.track(actionCompletionPromise);
            return actionCompletionPromise;
        }

        return Promise.resolve();
    };
};
