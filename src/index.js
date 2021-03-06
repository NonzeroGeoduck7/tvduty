// src/index.js

import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import * as serviceWorker from "./serviceWorker"
import { Auth0Provider } from "./react-auth0-wrapper"
import config from "./auth_config.json"
import ErrorBoundary from "./ErrorBoundary"
import * as Sentry from '@sentry/browser'

// A function that routes the user to the right place
// after login
const onRedirectCallback = appState => {
  window.history.replaceState(
    {},
    document.title,
    appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.pathname
  );
};

if (process.env.NODE_ENV !== 'development'){
  Sentry.init({dsn: "https://7138f7d690cd4cac92243def8fa03a08@sentry.io/1792135"})
}

ReactDOM.render(
  <ErrorBoundary>
    <Auth0Provider
      domain={config.domain}
      client_id={config.clientId}
      redirect_uri={window.location.origin}
      onRedirectCallback={onRedirectCallback}
    >
      <App />
    </Auth0Provider>
  </ErrorBoundary>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
