// src/components/EpisodeElement.js

import React from 'react'
import { useAuth0 } from "../react-auth0-wrapper";

function EpisodeElement(props) {
  const { user } = useAuth0();
  
  async function postAPI (source, data) {
    return fetch('/.netlify/functions/' + source, {
        method: 'post',
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .catch(err => err)
 }

  async function markWatched(seriesId, seasonNr, episodeNr) {
    console.log("mark episode " + seasonNr + "x" + episodeNr + " as watched for user " + user.sub)
	  
	  await postAPI('episodesMarkWatched', {seriesId: seriesId, seasonNr: seasonNr, episodeNr: episodeNr, userId: user.sub})
      .then(response => {
        console.log("response from episodeWatched: " + response.msg)
      })
      .catch(err => console.log('episodeWatched API error: ', err))
  }

  return (
    <div>
      {!props.watched?"not":""} watched - {props.seasonNr}x{props.episodeNr}: {props.title}
      
      <button onClick={()=>markWatched(props.seriesId, props.seasonNr, props.episodeNr)}>&#10004;</button>
    </div>
  );
}

export default EpisodeElement;
