// src/components/SettingsPage.js
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth0 } from "../react-auth0-wrapper"
import * as Sentry from '@sentry/browser'
import SweetAlert from 'react-bootstrap-sweetalert'
import Loading from './Loading'

import styled from 'styled-components'

const Title = styled.h1.attrs({
    className: 'h1',
})``

const Wrapper = styled.div.attrs({
    className: 'form-group',
})`
    margin: 0 30px;
`

const Label = styled.label`
    margin: 5px;
`

const InputText = styled.input.attrs({
    className: 'form-control',
})`
    margin: 5px;
`

const Button = styled.button.attrs({
    className: `btn btn-primary`,
})`
    margin: 15px 15px 15px 5px;
`

const CancelButton = styled.button.attrs({
    className: `btn btn-danger`,
})`
    margin: 15px 15px 15px 5px;
`

function validateEmail(mail) 
{
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)){
        return true
    } else {
        return false
    }
}

function SettingsPage () {
	  
  const { user } = useAuth0();
  let [loading, setLoading] = useState(false)
  let [settings, setSettings] = useState({})
  let [email, setEmail] = useState('')
  let [showSaveSettingsAlert, setShowSaveSettingsAlert] = useState(false)
  let [showInvalidEmailAlert, setShowInvalidEmailAlert] = useState(false)
  
  const handleSaveSettings = async () => {
    
    if(validateEmail(email)) {
        await fetch('/.netlify/functions/userUpdate', {
            method: 'POST',
            body: JSON.stringify({userId: user.sub, email: email})})
        .then(()=>{
            settings.email = email
            setSettings(settings)
            setShowSaveSettingsAlert(true)
        })
        .catch(err => console.log('Error updating userSeries: ', err))
    } else {
        setShowInvalidEmailAlert(true)
        return
    }
  }

  function keyPressed(event) {
      if (event.key === "Enter") {
          handleSaveSettings()
      }
  }

  const handleEmailChange = (event) => {
    setEmail(event.target.value)
  }

  useEffect(() => {
    setLoading(true)
    fetch('/.netlify/functions/userRead', {
        method: 'POST',
        body: JSON.stringify({userId: user.sub})})
    .then(res => res.json())
    .then(response => {
        if (response.data.length !== 1){
            Sentry.captureMessage(`Error, more than one entry for user ${user.sub} in database`)
        }
        setSettings(response.data[0])
    })
    .then(()=>{setLoading(false)})
    .catch(err => console.log('Error retrieving userSeries: ', err))

  }, [user.sub])

  return ( loading ?
        <Loading />:
        <Wrapper>
            <Title>Settings</Title>

            <Label>enter new email (currently is {settings.email}):</Label>
            <InputText
                type="email"
                value={email}
                onChange={handleEmailChange}
                onKeyPress={keyPressed}
            />

            <Button onClick={()=>handleSaveSettings()}>Save</Button>
            <Link to="/"><CancelButton>Go back</CancelButton></Link>
            {showSaveSettingsAlert&&
                <SweetAlert
                    success
                    title="Success!"
                    onConfirm={()=>setShowSaveSettingsAlert(false)}
                    timeout={3000}
                >
                    Settings saved.
                </SweetAlert>
            }
            {showInvalidEmailAlert&&
                <SweetAlert
                    danger
                    title="Error!"
                    onConfirm={()=>setShowInvalidEmailAlert(false)}
                >
                    Please enter a valid email address.
                </SweetAlert>
            }
        </Wrapper>
  )
}

export default SettingsPage;