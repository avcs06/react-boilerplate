import '../styles/home.scss';
import Container from '../lib/Container';
import Home from '../components/Home';

class HomeContainer extends Container {
    // Required if you want to namespace api in state, you can get the api response from state.api.home now
    static base = 'home';

    // Required unless you are planning to write your own render method
    // By default renders this component with api response
    static component = Home;

    // Api requests, by default all api requests are get requests, you can update actions/index.js for more features
    static api = {
        sampleApi1: 'http://localhost:1234/static/sample.json',
        sampleApi2: {
            // URL for api call
            url: 'http://localhost:1234/static/sample.json',
            // Data
            data: { something: true },
            // process response before saving in state
            process: d => d,
            // don't use cached response
            forceUpdate: true
        }
    };

    // Default values for api calls, for first render
    static defaults = {
        sampleApi1: '',
        sampleApi2: {}
    };

    // A meta data example, you can make your meta data based on props if you want
    getMetaData() {
        const metaData = {};
        if (this.props) {
            metaData.title = 'Your Site Title for this Page';
            metaData['meta:description'] = 'Sample Description for this Page';
            metaData['meta:og:description'] = 'Sample Description for Facebook';
            metaData['link:canonical'] = '/home';
        }
        return metaData;
    }
}

export default HomeContainer.getContainer();
