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
            process: d => d,
            forceUpdate: true
        }
    };

    static defaults = {
        sampleApi1: '',
        sampleApi2: {}
    };
}

export default HomeContainer.container;
