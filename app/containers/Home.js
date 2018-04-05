import { connect } from 'react-redux';

import Container from '../lib/Container';
import Home from '../components/Home';

class HomeContainer extends Container {
    // You can get the api data from state.api.home now
    static base = 'home';
    static component = Home;

    static api = {
        sampleApi1: 'http://localhost:1234/static/sample.json',
        sampleApi2: {
            url: 'http://localhost:1234/static/sample.json',
            data: {
                something: true
            },
            process: data => {
                console.log(data);
                return data;
            },
            forceUpdate: true
        }
    };

    static defaults = {
        sampleApi1: '',
        sampleApi2: {}
    };
}

export default connect(HomeContainer.getStateToPropsMap())(HomeContainer);
