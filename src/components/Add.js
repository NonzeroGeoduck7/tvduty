// src/components/Add.js
// add new series to tracked list
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth0 } from '../react-auth0-wrapper'
import LoadingOverlay from 'react-loading-overlay'
import placeholder from '../img/placeholder.png'
import { assureHttpsUrl } from '../helper/helperFunctions'
import { handleErrors, reportError } from '../helper/sentryErrorHandling'
import SweetAlert from 'react-bootstrap-sweetalert'
import Loading from './Loading'
import ErrorComponent from './ErrorComponent'

function Add () {
	  
  const { user } = useAuth0();

  let [hasError, setError] = useState(false)
  let [errorEventId, setErrorEventId] = useState()

  let [loading, setLoading] = useState(false) // is loading results from API
  let [processing, setProcessing] = useState(false) // is inserting into database
  let [input, setInput] = useState('')
  let [results, setResults] = useState([])
  let [showAddSeriesSuccessfulAlert, setShowAddSeriesSuccessfulAlert] = useState(false)
  
  function handleSearchInputChange(e) {
    const input = e.target.value
    
    setInput(input)
  }
  
  async function startSearch() {
	  const API_ENDPOINT = "https://api.tvmaze.com/search/shows?q="
	  
	  if (typeof(input) == "undefined"){
      var errorId = reportError(new Error("search query is undefined"))
      setError(true)
      setErrorEventId(errorId)
    }
    
    setLoading(true)

    const result = await fetch(API_ENDPOINT+input)
      .then(handleErrors)
	    .then(function(response) {
	      return response.json();
      })
      .catch(err=>{
        console.log("Error while reading from tvmaze API: "+JSON.stringify(err))
        var errorId = reportError(err)
        setErrorEventId(errorId)
        setError(true)
      })
    
      setResults(result)
      setLoading(false)
  }
  
  function putAPI (source, data) {
    return fetch('/.netlify/functions/' + source, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      .then(handleErrors)
      .then(res => res.json())
      .catch(err=>{
        console.log("Error while reading from tvmaze API: "+JSON.stringify(err))
        var errorId = reportError(err)
        setErrorEventId(errorId)
        setError(true)
      })
  }
  
  async function addSeries(id) {
    setProcessing(true)
	  
	  await putAPI('seriesCreate', {id: id, userId: user.sub})
	  
    setProcessing(false)
    setShowAddSeriesSuccessfulAlert(true)
  }
  
  function keyPressed(event) {
    if (event.key === "Enter") {
      startSearch()
    }
  }

  return (
  hasError ? <ErrorComponent eventId={errorEventId} />:
  loading ? <Loading />:
  <LoadingOverlay
    active={processing}
    spinner
    text='Processing request...'>
      <div>
      <input
        name='search'
        type='string' value={input}
        onChange={handleSearchInputChange}
        onKeyPress={keyPressed}
      />
      <button onClick={startSearch}>search</button>
      </div>
      <div>
        <Link to="/">
          <button>Go back</button>
        </Link>
      </div>
      {results.map(c =>
        <div key={c.show.id}>
          <img
            width={200}
            alt={c.show.name+" poster"}
            src={c.show.image!=null?assureHttpsUrl(c.show.image.medium):placeholder}
          />
          <label>
            {c.show.name} - Status: {c.show.status}, premiered: {c.show.premiered} 
          </label>
          <button
            onClick={()=>addSeries(c.show.id)}>add to my list
          </button>
        </div>
      ) }
      {showAddSeriesSuccessfulAlert&&
        <SweetAlert
          success
          title="Success!"
          onConfirm={()=>setShowAddSeriesSuccessfulAlert(false)}
          timeout={5000}
        >
          Series successfully added to your list
        </SweetAlert>
      }
  </LoadingOverlay>
  )
}

export default Add;