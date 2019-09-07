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
	  
	  {user && <p>{user.name} - {user.sub}</p>}

      {isAuthenticated && <button onClick={() => logout()}>Log out</button>}
    </div>
  );
};

export default NavBar;
