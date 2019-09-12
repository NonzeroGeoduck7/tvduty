// src/components/NavBar.js

import React from "react";
import { useAuth0 } from "../react-auth0-wrapper";

const NavBar = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <div>
      {!isAuthenticated && (
        <button
          onClick={() =>
            loginWithRedirect({})
          }
        >
          Log in
        </button>
      )}
	  
	  {user && <p>logged in as {user.name} - {user.sub} - subs_id= <p id='subs_id'/></p>}

      {isAuthenticated && <button onClick={() => logout()}>Log out</button>}
    </div>
  );
};

export default NavBar;
