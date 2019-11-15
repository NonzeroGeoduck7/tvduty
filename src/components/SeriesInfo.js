// src/components/SeriesInfo.js

import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import Loading from './Loading'
import DataTable from 'react-data-table-component'
import moment from 'moment'
import { useAuth0 } from "../react-auth0-wrapper"
import { seasonEpisodeNotation } from "../helper/helperFunctions"
import { LazyLoadImage } from 'react-lazy-load-image-component'
import EpisodePlaceholder from '../img/placeholder.png'
import { getWindowDimensions } from "../helper/helperFunctions"
import * as Sentry from '@sentry/browser'

function SeriesInfo ({ match }) {
  const { user } = useAuth0();
  let [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())
  let [lastWatchedEpisode, setLastWatchedEpisode] = useState()

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const columns = [
    {
      name: 'Number',
      selector: 'seasonEpisodeNotation',
      sortable: true,
      width: '10%',
      resizable: true,
    },
    {
      name: 'Title',
      selector: 'title',
      sortable: true,
      width: '40%',
      resizable: true,
    },
    {
      name: 'Airdate',
      selector: 'airstamp',
      sortable: true,
      format: d => moment(d.airstamp).format('llll'),
      width: '30%',
      resizable: true,
    },
    {
      name: 'watched',
      cell: (data) => <button onClick={()=>markWatched(data.seriesId, data.seasonNr, data.episodeNr, data.index)}>&#10004;</button>,
      width: '10%',
      resizable: true,
    },
  ]

  var conditionalRowStyles = [
    {
      'when': row => row.airstamp == null || new Date(row.airstamp) > Date.now(),
      style: {
        backgroundColor: 'rgba(254, 36, 43, 0.2)', // light red
      },
    },
    {
      'when': row => row.watched,
      style: {
        backgroundColor: 'rgba(68, 249, 68, 0.2)', // light green
      },
    },
  ];
  
  const { width } = windowDimensions
  let imageWidth = Math.min(1280,width - 25)
  const ExpandedComponent = ({ data }) => (
    <div style={{width: document.innerWidth}}>
      {/* TODO: scrollPosition is added to props. performance? */}
      <LazyLoadImage
        width={imageWidth}
        height={imageWidth*9/16}
        placeholderSrc={EpisodePlaceholder}
        effect="blur"
        src={data.image}
      />
      <div dangerouslySetInnerHTML={{ __html: data.summary }} />
    </div>
  )

  async function postAPI (source, data) {
    return fetch('/.netlify/functions/' + source, {
        method: 'post',
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .catch(err => err)
  }
  
  async function markWatched(seriesId, seasonNr, episodeNr, index) {
    console.log("mark episode " + seasonNr + "x" + episodeNr + " as watched for user " + user.sub)
    
    await postAPI('episodesMarkWatched', {seriesId: seriesId, seasonNr: seasonNr, episodeNr: episodeNr, userId: user.sub})
      .catch(err => console.log('episodeWatched API error: ', err))

    setLastWatchedEpisode(index)
  }

  
  let [episodeListLoading, setEpisodeListLoading] = useState(false)
  let [episodesList, setEpisodesList] = useState([])
  
  const { params: { extId:seriesId } } = match
  
  useEffect(() => {
    fetch('/.netlify/functions/userSeriesRead?seriesId='+seriesId+'&userId='+user.sub)
      .then(res => res.json())
      .then(response => {
        if (response.data.length !== 1){
          Sentry.captureException("userSeries found <> 1 result for seriesId "+seriesId+" and user "+user.sub+": "+response.data)
        } else {
          setLastWatchedEpisode(response.data[0].lastWatchedEpisode)
        }
      })
      .catch(err => console.log('Error retrieving userSeries: ', err))

  }, [seriesId, user.sub])

  useEffect(() => {
    if (lastWatchedEpisode==null){
      console.log("lastWatchedEpisode not yet available, skipping")
      return
    }

    console.log("useEffect method completed, showsInfo updated.")
  
    // Fetch the Episodes from the database
    setEpisodeListLoading(true);

    if (episodesList.length === 0){
      fetch('/.netlify/functions/episodesRead?seriesId='+seriesId)
      .then(res => res.json())
      .then(response => {
        setEpisodesList(response.data.map(function(entry, idx){
          entry.seasonEpisodeNotation = seasonEpisodeNotation(entry.seasonNr, entry.episodeNr)
          entry.index=idx
          entry.watched=idx <= lastWatchedEpisode
          return entry
        }))
        setEpisodeListLoading(false)
      })
      .catch(err => console.log('Error retrieving episodes: ', err))
    } else {
      // episodesList is already loaded, just update lastWatchedEpisode
      setEpisodesList(episodesList.map(function(entry, idx){
        entry.watched=idx <= lastWatchedEpisode
        return entry
      }))
      setEpisodeListLoading(false)
    }
	  
  }, [seriesId, lastWatchedEpisode]);

  return (
    <div>
      <div>
        <Link to="/">
          <button>Go back</button>
        </Link>
      </div>
        seriesId: {seriesId}<br/>
      <br/>
      <div style={{color: 'green'}}>green = Episode already watched</div>
      <div style={{color: 'red'}}>red = Episode not out yet</div>
      <br/>
      {episodeListLoading ? <Loading /> :
        <DataTable
          title="Episode List"
          columns={columns}
          data={episodesList}
          style={{width: document.innerWidth}}
          conditionalRowStyles={conditionalRowStyles}
          defaultSortField={"seasonEpisodeNotation"}
          defaultSortAsc={false}
          highlightOnHover
          expandableRows
          expandOnRowClicked
          expandableRowsComponent={<ExpandedComponent />}
        />
      }
    </div>
  );
}

export default SeriesInfo;
