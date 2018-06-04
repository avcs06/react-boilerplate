import React from 'react';
import Container from '../lib/Container';
import { Route, Switch } from 'react-router-dom';

import Header from '../components/Header';
import Content from '../components/Content';

class App extends Container {
    render() {
        return (
            <div className="root">
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
