// src/App.js

import React from "react";
import NavBar from "./components/Navbar";
import { useAuth0 } from "./react-auth0-wrapper";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import SeriesTable from './components/SeriesTable'
import Profile from './components/Profile'
import Add from './components/Add'

function App() {
  const { loading } = useAuth0();

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
          <Route path="/" exact component={SeriesTable} />
	  	  <Route path="/add" component={Add} />
          <Route path="/profile" component={Profile} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
