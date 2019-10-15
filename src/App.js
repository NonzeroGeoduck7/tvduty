// src/App.js

import React from "react";
import NavBar from "./components/Navbar";
import { useAuth0 } from "./react-auth0-wrapper";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import SeriesTable from './components/SeriesTable'
import SeriesInfo from './components/SeriesInfo'
import Add from './components/Add'

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
        {isAuthenticated && <Switch>
            <Route path="/" exact component={SeriesTable} />
            <Route path="/series/:extId" component={SeriesInfo} />
            <Route path="/add" component={Add} />
          </Switch>}
        {!isAuthenticated && <div>Please log in to see this page</div>}
      </BrowserRouter>
    </div>
  );
}

export default App;
