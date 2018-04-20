import React from 'react';
import Loadable from 'react-loadable';
import Loader from '../components/Loader';

export default path => (
    Loadable({
        loader: () => import(`../${path}`),
        loading: () => <Loader />,
        modules: [path.split('/').join('-').toLowerCase()]
    })
);
