// src/components/Add.js
// add new series to tracked list
import React, { useState } from 'react'
import { Link } from "react-router-dom";
import { useAuth0 } from "../react-auth0-wrapper";

function Add () {
	  
  const { user } = useAuth0();
  let [input, setInput] = useState('')
  let [results, setResults] = useState([])
  
  function handleSearchInputChange(e) {
    const input = e.target.value
    
    setInput(input)
  }
  
  async function startSearch() {
	  const API_ENDPOINT = "https://api.tvmaze.com/search/shows?q="
	  
	  let q = input
	  
	  if (typeof(q) == "undefined"){
		  console.log("undefined")
		  return
	  }
	  const myJson = await fetch(API_ENDPOINT+q)
	    .then(function(response) {
	      return response.json();
	    });
	  
	  setResults(myJson)
	  console.log("search complete")
  }
  
  function postAPI (source, data) {
     return fetch('/.netlify/functions/' + source, {
         method: 'post',
         body: JSON.stringify(data)
       })
       .then(res => res.json())
       .catch(err => err)
  }
  
  async function addSeries(id) {
	  console.log("add series with id: "+id+" to user "+user.sub)
	  
	  await postAPI('seriesCreate', {id: id, userId: user.sub})
      .then(response => {
        console.log("response from seriesCreate: " + response.msg)
      })
      .catch(err => console.log('Series.create API error: ', err))
	  
	  await postAPI('deploy-succeeded', {})
      .then(response => {
        console.log("response from deploy-succeeded: " + response.msg)
      })
      .catch(err => console.log('Series.create API error: ', err))
  }
  
  return (
	<div>
	  <div>
		<input name='search' type='string' value={input} onChange={handleSearchInputChange} />
		<button onClick={startSearch}>search</button>
	  </div>
	  {results.map(c => <div><button onClick={()=>addSeries(c.show.id)}>&#43;</button><label>{c.show.name} - {c.show.status}</label></div>
	  ) }
	  <div>
		  <Link to="/">
		  	<button>Go back</button>
		  </Link>
      </div>
	</div>
  )
}

export default Add;