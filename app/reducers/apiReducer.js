import { API_REQUEST } from '$actions';
import { merge } from 'immutable';

export default (state = {}, action) => {
    if (action.type === API_REQUEST) {
        let stateUpdate = action.response;
        if (action.base) {
            stateUpdate = {
                [action.base]: stateUpdate
            };
        }

        return merge(state, stateUpdate);
    }

    return state;
};
