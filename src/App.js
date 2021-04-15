// src/App.js

import React from "react";
import NavBar from "./components/Navbar";
import { useAuth0 } from "./react-auth0-wrapper";
import { BrowserRouter, Route } from "react-router-dom";
import CacheRoute, { CacheSwitch } from 'react-router-cache-route'

import SeriesTable from './components/SeriesTable'
import SeriesInfo from './components/SeriesInfo'
import Add from './components/Add'
import EventResult from './components/EventResult'
import NotLoggedIn from './components/NotLoggedIn'
import NotVerifiedAccount from './components/NotVerifiedAccount'
import SettingsPage from './components/SettingsPage'
import AppContainer from './AppContainer'

// react-bootstrap-sweetalert
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  const { isAuthenticated, loading, user } = useAuth0()

  const allowedToSee = isAuthenticated && user && user.email_verified

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
        <CacheSwitch>
          <AppContainer>
          {allowedToSee ? <React.Fragment>
              <CacheRoute path="/" exact component={SeriesTable} when="always" />
              <Route path="/series/:extId" component={SeriesInfo}/>
              <Route path="/add" component={Add} />
              <Route path="/settings" component={SettingsPage} />
              <Route path="/event/:eventUid" component={EventResult} />
            </React.Fragment> : 
            <React.Fragment>
              <CacheRoute path="/" exact component={isAuthenticated ? SeriesTable : NotLoggedIn} when="always" />
              <Route path="/series/:extId" component={user && !user.email_verified ? NotVerifiedAccount : NotLoggedIn}/>
              <Route path="/add" component={user && !user.email_verified ? NotVerifiedAccount : NotLoggedIn} />
              <Route path="/settings" component={user && !user.email_verified ? NotVerifiedAccount : NotLoggedIn} />
              <Route path="/event/:eventUid" component={EventResult} />
            </React.Fragment>
          }
          </AppContainer>
        </CacheSwitch>
      </BrowserRouter>
    </div>
  );
}

export default App;
