import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js';
import AutorBox from './components/Autor.js';
import LivroBox from './components/Livro';
import Home from './components/Home';
import './index.css';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';

ReactDOM.render((
    <Router>
        <App>
            <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/autor" component={AutorBox} />
                <Route path="/livro" component={LivroBox}/>
            </Switch>
        </App>
    </Router>

), document.getElementById('root'));