
import extend from 'extend';
import Loadable from 'react-loadable';
import Loader from '$components/Loader';

export default options => (
    Loadable(extend({
        loading: Loader,
        delay: 200
    }, options))
);
