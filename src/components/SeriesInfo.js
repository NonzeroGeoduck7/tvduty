// src/components/SeriesInfo.js

import React, { useState, useEffect } from 'react'
import EpisodeElement from './EpisodeElement'
import { Link } from "react-router-dom"
import Loading from './Loading'

function SeriesInfo ({ match }) {
  
  let [episodeListLoading, setEpisodeListLoading] = useState(false)
  let [episodesList, setEpisodesList] = useState([])
  let [series, setSeries] = useState([])
  
  const { params: { extId:seriesId } } = match
  
  useEffect(() => {
    console.log("useEffect method completed, showsInfo updated.")

    /*
    fetch('/.netlify/functions/userSeriesRead?seriesId='+seriesId)
  	.then(res => res.json())
  	.then(response => {
  	  setSeries(response.data)
  	})
    .catch(err => console.log('Error retrieving series: ', err))
    */
  
    // Fetch the Episodes from the database
    setEpisodeListLoading(true);
    fetch('/.netlify/functions/episodesRead?seriesId='+seriesId)
  	.then(res => res.json())
  	.then(response => {
      setEpisodesList(response.data)
      setEpisodeListLoading(false)
  	})
    .catch(err => console.log('Error retrieving episodes: ', err))
	  
  }, [seriesId]);

  return (
    <div>
      <div>
        <Link to="/">
          <button>Go back</button>
        </Link>
      </div>
      seriesId: {seriesId}
      {episodeListLoading ? <Loading /> : episodesList.map(e =>
        <EpisodeElement
          seriesId={seriesId} // seriesId
          seasonNr={e.seasonNr}
          episodeNr={e.episodeNr}
          title={e.title}
          watched={false}
          image={e.image}
          airstamp={e.airstamp}
          runtime={e.runtime}
          summary={e.summary}
        />
      )}
    </div>
  );
}

export default SeriesInfo;
