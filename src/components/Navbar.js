// src/components/NavBar.js

import React from 'react'
import { useAuth0 } from '../react-auth0-wrapper'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import KeyboardEventHandler from 'react-keyboard-event-handler';

import Logo from '../img/logo.png';

const Wrapper = styled.div`
    background: #f5f7f9;
    border-bottom: 1px solid #d8d8d8;
    margin-bottom: 10px;
    padding: 10px;
`

const LogoDiv = styled.div`
    text-align: left;
    display: inline-block;
    width: 33%;
`

const UsernameDiv = styled.div`
    text-align: center;
    color: black;
    font-size: 1.5em;
    display: inline-block;
    width: 33%;
    margin-bottom: 5px;
    vertical-align: bottom;
`

const LogoutButtonDiv = styled.div`
    text-align: right;
    display: inline-block;
    width: 33%;
    vertical-align: bottom;
`

const LoginButtonDiv = styled.div`
    text-align: right;
    display: inline-block;
    width: 66%;
    vertical-align: bottom;
`

const LoginButton = styled.button`
    background: white;
    color: black;
    font-size: 1em;
    padding: 0.5em 2em;
    margin-bottom: 10px;
    border: 2px solid orange;
    border-radius: 3px;
`

const LogoutButton = styled.button`
    background: white;
    color: black;
    font-size: 1em;
    padding: 0.5em 2em;
    margin-bottom: 10px;
    border: 2px solid red;
    border-radius: 3px;
`

const SettingsButton = styled.button`
    background: white;
    color: black;
    font-size: 1em;
    padding: 0.5em 1em;
    margin-right: 10px;
    margin-bottom: 10px;
    border: 2px solid orange;
    border-radius: 3px;
`

const NavBar = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0()

  return (
    <Wrapper>
	  
      <LogoDiv>
        <Link to="/">
          <img src={Logo} alt={"logo.png"} style={{"height":"96px", "width":"96px"}}></img>
        </Link>
      </LogoDiv>
	    {user && <UsernameDiv>{user.name}</UsernameDiv>}
      
      {isAuthenticated ? 
        <LogoutButtonDiv>
          <Link to="/settings">
            <SettingsButton>
              &#9881;
            </SettingsButton>
          </Link>
          <LogoutButton onClick={() => logout()}>
            Log out
          </LogoutButton>
        </LogoutButtonDiv>
      :
        <LoginButtonDiv>
          <LoginButton onClick={() => loginWithRedirect({})}>Log in</LoginButton>
        </LoginButtonDiv>
      }
      {!isAuthenticated &&
        <KeyboardEventHandler
          handleKeys={['enter']}
          isExclusive={true}
          onKeyEvent={() => loginWithRedirect({})} />
      }
    </Wrapper>
  )
}

export default NavBar