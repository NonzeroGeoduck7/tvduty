// src/components/SeriesInfo.js

import React, { useState, useEffect } from 'react'
import EpisodeElement from './EpisodeElement'

function SeriesInfo ({ match, location }) {
  
  let [episodesList, setEpisodesList] = useState([])
  
  const { params: { extId:seriesId } } = match;
  
  useEffect(() => {
    console.log("useEffect method completed, showsInfo updated.")
  
    // Fetch the Episodes from the database
    fetch('/.netlify/functions/episodesRead?seriesId='+seriesId)
  	.then(res => res.json())
  	.then(response => {
  	  setEpisodesList(response.data)
  	})
  	.catch(err => console.log('Error retrieving products: ', err))
	  
  }, [seriesId]);

  return (
    <div>
      seriesId: {seriesId}
	  {episodesList.map(e => <EpisodeElement episode={e} />)}
    </div>
  );
}

export default SeriesInfo;
