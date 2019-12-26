// src/components/Add.js
// add new series to tracked list
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth0 } from '../react-auth0-wrapper'
import LoadingOverlay from 'react-loading-overlay'
import placeholder from '../img/placeholder.png'
import { assureHttpsUrl } from '../helper/helperFunctions'
import SweetAlert from 'react-bootstrap-sweetalert'

function Add () {
	  
  const { user } = useAuth0();
  let [processing, setProcessing] = useState(false)
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
		  throw new Error("search query is undefined")
    }
    
	  const result = await fetch(API_ENDPOINT+input)
	    .then(function(response) {
	      return response.json();
	    })
	  
	  setResults(result)
  }
  
  function postAPI (source, data) {
     return fetch('/.netlify/functions/' + source, {
         method: 'POST',
         body: JSON.stringify(data)
       })
       .then(res => res.json())
       .catch(err => err)
  }

  function getAPI (source) {
    return fetch('/.netlify/functions/' + source, {
      method: 'GET',
    })
    .then(res => res.json())
    .catch(err => err)
  }
  
  async function addSeries(id) {
    setProcessing(true)
	  
	  await postAPI('seriesCreate', {id: id, userId: user.sub})
      .then(response => {
        console.log("response from seriesCreate: " + response.msg)
      })
      .catch(err => {throw err})
	  
    setProcessing(false)
    setShowAddSeriesSuccessfulAlert(true)
  }
  
  function keyPressed(event) {
    if (event.key === "Enter") {
      startSearch()
    }
  }

  return (
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
      {results.map(c =>
        <div>
          <img
            width={200}
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
      <div>
        <Link to="/">
          <button>Go back</button>
        </Link>
      </div>
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