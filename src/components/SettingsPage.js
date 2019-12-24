// src/components/SettingsPage.js
import React, { useState, useEffect } from 'react'
import { useAuth0 } from "../react-auth0-wrapper"
import * as Sentry from '@sentry/browser'

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

const CancelButton = styled.a.attrs({
    className: `btn btn-danger`,
})`
    margin: 15px 15px 15px 5px;
`

function SettingsPage () {
	  
  const { user } = useAuth0();
  let [loading, setLoading] = useState(false)
  let [settings, setSettings] = useState({})
  let [email, setEmail] = useState('')
  
  const handleEmailChange = (event) => {
    setEmail(event.target.value)
  }

  const handleSaveSettings = (event) => {
    // pass
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
    .catch(err => console.log('Error retrieving userSeries: ', err))
    .finally(setLoading(false))

  }, [user.sub])

  return (
    <Wrapper>
        {loading?
        <p>loading</p>:<div>
            <Title>Settings</Title>

            <Label>enter new email (currently is {settings.email}):</Label>
            <InputText
                type="email"
                value={email}
                onChange={handleEmailChange}
            />

            <Button onClick={handleSaveSettings}>Save</Button>
            <CancelButton>Cancel</CancelButton>
        </div>
        }
    </Wrapper>
  )
}

export default SettingsPage;