// src/components/EventResult.js
// 
import React, { useState, useEffect } from 'react'
import { handleErrors, reportError } from '../helper/sentryErrorHandling'
import ErrorComponent from './ErrorComponent'

function EventResult ({ match }) {

  const { params: { eventUid } } = match

  let [hasError, setError] = useState(false)
  let [errorEventId, setErrorEventId] = useState()
  let [loading, setLoading] = useState(false)
  let [note, setNote] = useState()
  
  function postAPI (source, data) {
    return fetch('/.netlify/functions/' + source, {
        method: 'POST',
        body: JSON.stringify(data)
      })
      .then(handleErrors)
      .then(res => res.json())
      .then(response => setNote(response.msg))
  }

  useEffect(() => {
    const report = async (err)=>{
      var eventId = await reportError(err)
      setErrorEventId(eventId)
    }

    setLoading(true)

    postAPI('processEvent', { eventUid: eventUid })
      .catch(err => {
        console.log('process event error: ', err)
        report(err)
        setError(true)
      })
      .finally(()=> setLoading(false))
  }, [eventUid])

  return (
      hasError ? <ErrorComponent eventId={errorEventId} />
        : loading ? <div>processing request...</div>
          : <div>{note}</div>
  )
}

export default EventResult
