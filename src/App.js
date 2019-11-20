// src/App.js

import React from "react";
import NavBar from "./components/Navbar";
import { useAuth0 } from "./react-auth0-wrapper";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import SeriesTable from './components/SeriesTable'
import SeriesInfo from './components/SeriesInfo'
import Add from './components/Add'
import EventResult from './components/EventResult'
import NotLoggedIn from './components/NotLoggedIn'

function App(props) {
  const { isAuthenticated, loading } = useAuth0();

  if (loading) {
    return (
      <div>Authorizing user...</div>
    );
  }

  return (
	<div className="App">
      <BrowserRouter>
        <header>
          <NavBar />
        </header>
        <Switch>
          {isAuthenticated ? <React.Fragment>
              <Route path="/" exact component={SeriesTable} />
              <Route path="/series/:extId" component={SeriesInfo} />
              <Route path="/add" component={Add} />
              <Route path="/event/:eventUid" component={EventResult} />
            </React.Fragment> : 
            <React.Fragment>
              <Route path="/" exact component={NotLoggedIn} />
              <Route path="/event/:eventUid" component={EventResult} />
            </React.Fragment>
          }
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
