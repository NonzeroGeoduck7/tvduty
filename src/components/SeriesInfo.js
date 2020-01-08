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
import SweetAlert from 'react-bootstrap-sweetalert'

const axios = require('axios')

function SeriesInfo ({ match }) {
  const { user } = useAuth0();
  let [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())
  let [lastWatchedEpisode, setLastWatchedEpisode] = useState()
  let [showMarkAsWatchedAlert, setShowMarkAsWatchedAlert] = useState(false)

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
      cell: (data) => new Date(data.airstamp)>Date.now()?<div />:<button onClick={()=>markWatched(data.seriesId, data.seasonNr, data.episodeNr, data.index)}>&#10004;</button>,
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
        method: 'POST',
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .catch(err => err)
  }
  
  async function markWatched(seriesId, seasonNr, episodeNr, index) {
    
    await postAPI('episodesMarkWatched', {seriesId: seriesId, seasonNr: seasonNr, episodeNr: episodeNr, userId: user.sub})
      .catch(err => console.log('episodeWatched API error: ', err))

    setLastWatchedEpisode(index)
    setShowMarkAsWatchedAlert(true)
  }

  
  let [episodeListLoading, setEpisodeListLoading] = useState(false)
  let [episodesList, setEpisodesList] = useState([])
  
  const { params: { extId:seriesId } } = match
  
  function getUserSeries() {
    return axios.post('/.netlify/functions/userSeriesRead', {
      seriesId: seriesId,
      userId: user.sub
    })
  }

  function getEpisodes() {
    return axios.post('/.netlify/functions/episodesRead', {
      seriesId: seriesId
    })
  }

  useEffect(() => {
    setEpisodeListLoading(true)
    Promise.all([getUserSeries(), getEpisodes()])
      .then(function ([userSeriesRes, episodesRes]) {
        if (userSeriesRes.data.data.length !== 1){
          Sentry.captureException("userSeries found <> 1 result for seriesId "+seriesId+" and user "+user.sub+": "+userSeriesRes.data.data)
        } else {
          var lastWatchedEp = userSeriesRes.data.data[0].lastWatchedEpisode
          setEpisodesList(episodesRes.data.data.map(function(entry, idx){
            entry.seasonEpisodeNotation = seasonEpisodeNotation(entry.seasonNr, entry.episodeNr)
            entry.index=idx
            entry.watched=idx <= lastWatchedEp
            return entry
          }))
          setEpisodeListLoading(false)
        }
      })
      .catch(err=>console.log(err))
    
  }, [seriesId, user.sub, lastWatchedEpisode])

  return (
    <div>
      <div>
        <Link to="/">
          <button>Go back</button>
        </Link>
      </div>
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
      {showMarkAsWatchedAlert &&
        <SweetAlert
          success
          title="Success!"
          onConfirm={()=>setShowMarkAsWatchedAlert(false)}
          timeout={3000}
        >
          Episode marked as watched
        </SweetAlert>
      }
    </div>
  );
}

export default SeriesInfo;
