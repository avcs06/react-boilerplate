import '../styles/home.scss';
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
