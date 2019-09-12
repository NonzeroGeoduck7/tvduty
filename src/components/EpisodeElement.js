// src/components/EpisodeElement.js

import React from 'react'

const EpisodeElement = (props) => {
  
  return (
    <div>
      {JSON.stringify(props.episode.title)}
    </div>
  );
}

export default EpisodeElement;
