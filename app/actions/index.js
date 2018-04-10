import extend from 'extend';
import Promise from 'bluebird';
import get from '../../common/get';

export const API_REQUEST = 'API_REQUEST';

const noopd = data => data;
const apiRequest = (response, base) => {
    return { type: API_REQUEST, response, base };
};

export const getApiRequestAction = options => {
    const apis = options.api || [];
    const base = options.base || null;
    const state = options.state || {};
    const session = options.session || null;

    return (dispatch) => {
        const requests = [];

        Object.keys(apis).forEach(context => {
            let api = apis[context];

            if (!state.hasOwnProperty(context) || (api.forceUpdate && api._calledOnce)) {
                if (typeof api === 'string') {
                    api = apis[context] = { url: api };
                }

                requests.push(
                    get(api.url, api.data)
                    .then(response => {
                        api._calledOnce = true;
                        return { [context]: (api.process || noopd)(response) };
                    })
                );
            }

            if (api.forceUpdate && !api._calledOnce) {
                api._calledOnce = true;
            }
        });

        if (requests.length) {
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

            session && session.track(actionCompletionPromise);
            return actionCompletionPromise;
        }

        return Promise.resolve();
    };
};
