import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import { Provider } from 'react-redux';
import Login from './components/user/Login';
import Signup from './components/user/Signup';
import Landing from './components/landingPage/Landing';
import Navbar from './components/landingPage/Navbar';

// Redux
import store from './store';
import Alert from './components/landingPage/Alert';
import { loadUser } from './actions/auth';
import setToken from './utils/setToken';

const App = () => {
  useEffect(() => {
    if (localStorage.token) {
      setToken(localStorage.token);
    }
    store.dispatch(loadUser());
  }, []);
  return (
    <Provider store={store}>
      <Router>
        <>
          <Navbar />

          <Alert />
          <Switch>
            <Route exact path='/' component={Landing} />
            <Route exact path='/login' component={Login} />
            <Route exact path='/signup' component={Signup} />
          </Switch>
        </>
      </Router>
    </Provider>
  );
};

export default App;
