// src/components/NotLoggedIn.js
// 
import React from 'react'
import styled from 'styled-components'
import posed from 'react-pose'

import { useAuth0 } from '../react-auth0-wrapper'

import Step1 from '../img/step1.png'
import Step2 from '../img/step2.png'
import Step3 from '../img/step3.png'

const TutorialWrapper = styled.div`
  text-align: center;
  background: #ffffff;
  margin-bottom: 10px;
  padding: 10px;
`

const StepDiv = styled.div`
  border: 3px solid #ff8000;
  text-align: center;
  margin: 30px;
  display: inline-block;
`

const TitleDiv = styled.div`
  text-align: center;
  color: black;
  font-size: 1.5em;
`

const TextDiv = styled.div`
  text-align: center;
  color: black;
  font-size: 1em;
  padding: 10px;
`

const GetStartedDiv = styled.div`
  text-align: center;
  background: #ffffff;
  margin-bottom: 10px;
  padding: 10px;
`

const LoginButtonDiv = styled.div`
  text-align: center;
  display: inline-block;
  width: 33%;
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

function NotLoggedIn() {
  
  const { loginWithRedirect } = useAuth0()

  return (
    <TutorialWrapper>
      <TitleDiv>
        {"Only three steps necessary for setup"}
      </TitleDiv>
      <StepDiv>
        <img src={Step1} alt={"step1.png"} style={{"min-width":"200px"}}></img>
      </StepDiv>
      <StepDiv>
        <img src={Step2} alt={"step2.png"} style={{"min-width":"200px"}}></img>
      </StepDiv>
      <StepDiv>
        <img src={Step3} alt={"step3.png"} style={{"min-width":"200px"}}></img>
      </StepDiv>
      <GetStartedDiv>
        <TextDiv>Interested?</TextDiv>
        <LoginButtonDiv>
          <LoginButton onClick={() => loginWithRedirect({})}>Get Started</LoginButton>
        </LoginButtonDiv>
      </GetStartedDiv>
    </TutorialWrapper>
  )
}

export default NotLoggedIn