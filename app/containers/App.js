import React from 'react';
import Container from '../lib/Container';
import { Route, Switch } from 'react-router-dom';
import getComponent from '../lib/getComponent';

const Header = getComponent('components/Header');
const Content = getComponent('components/Content');

class App extends Container {
    render() {
        return (
            <div className="main">
                <Header />
                <Switch>
                    <Route exact path="/" component={Content} />
                    <Route path="/:route" component={Content} />
                </Switch>
            </div>
        );
    }
}

export default App.getContainer();
