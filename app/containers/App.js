import React from 'react';
import Container from '../lib/Container';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import Header from '../components/Header';
import Menu from '../components/Menu';
import Content from '../components/Content';

class App extends Container {
    static api = {
        api_name: {
            url: 'api_url',
            data: {}
        }
    };

    render() {
        const api_response = this.props.api_name;
        return (
            <div className="main">
                <Header />
                <Menu />
                <Switch>
                    <Route exact path="/" component={Content} />
                    <Route path="/:route" component={Content} />
                </Switch>
            </div>
        );
    }
}

export default connect(App.getStateToPropsMap())(App);
