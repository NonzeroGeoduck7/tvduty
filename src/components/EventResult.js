// src/components/EventResult.js
// 
import React, { useState, useEffect } from 'react'
import * as Sentry from '@sentry/browser'

function EventResult ({ match }) {

  const { params: { eventUid } } = match

  let [loading, setLoading] = useState(false)
  let [note, setNote] = useState()
  
  function postAPI (source, data) {
    return fetch('/.netlify/functions/' + source, {
        method: 'POST',
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .then(response => setNote(response.msg))
      .catch(err => {
        Sentry.captureException('error in postAPI of event processing: ', err)
      })
  }

  useEffect(() => {
    console.log("start useEffect")

    setLoading(true)

    postAPI('processEvent', {eventUid: eventUid})
      .then(()=> setLoading(false))
      .catch(err => {
        console.log('process event error: ', err)
        Sentry.captureException('process event error: ', err)
      })
  }, [eventUid])

  return (
    loading ? <div>processing request...</div> : <div>{note}</div>
  )
}

export default EventResult
