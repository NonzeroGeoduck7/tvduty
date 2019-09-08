// src/components/SeriesInfo.js

import React, { useState } from 'react'
import EpisodeElement from './EpisodeElement'

function SeriesPage ({ match, location }) {
  
  let [episodes, setEpisodes] = useState([])
  
  const { params: { seriesId } } = match;
  
  return (
    <div>
      seriesId: {seriesId}
	  {episodes.map(e => <EpisodeElement episode={e} />)}
    </div>
  );
}

export default SeriesPage;
