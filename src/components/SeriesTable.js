// SeriesTable.js
import React, { useState, useEffect } from 'react'
import SeriesElement from './SeriesElement'
import { Link } from "react-router-dom";

import { useAuth0 } from "../react-auth0-wrapper";

function SeriesTable() {
	
  let [seriesList, setSeriesList] = useState([])
  const { user } = useAuth0();

  // replaces componentDidMount -> reload when user.sub changes
  useEffect(() => {
      console.log("useEffect method completed, showsTable updated.")
	
	  // Fetch the Series from the database
	  fetch('/.netlify/functions/seriesRead')
		.then(res => res.json())
		.then(response => {
		  let filtered = response.data.filter(e=>e.userseries.filter(e1=>e1.userId===user.sub).length > 0)
		  setSeriesList(filtered)
		})
		.catch(err => console.log('Error retrieving products: ', err))
	  
  }, [user.sub]);
	
  return (
    <div>
  	  <p>Series</p>
	  {seriesList.map(c => <SeriesElement key={c.extId} title={c.title} poster={c.poster} extId={c.extId} />)}
  	  <Link to="/add">
  	    <button>&#43;</button>
  	  </Link>
    </div>
  )
}

export default SeriesTable;