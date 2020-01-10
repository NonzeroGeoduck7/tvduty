// src/components/SeriesInfo.js

import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import Loading from './Loading'
import ErrorComponent from './ErrorComponent'
import DataTable from 'react-data-table-component'
import moment from 'moment'
import { useAuth0 } from "../react-auth0-wrapper"
import { seasonEpisodeNotation } from "../helper/helperFunctions"
import { LazyLoadImage } from 'react-lazy-load-image-component'
import EpisodePlaceholder from '../img/placeholder.png'
import { getWindowDimensions } from "../helper/helperFunctions"
import SweetAlert from 'react-bootstrap-sweetalert'
import { handleErrors, reportError } from '../helper/sentryErrorHandling'

const axios = require('axios')

function SeriesInfo ({ match }) {
  const { user } = useAuth0();

  let [hasError, setError] = useState(false)
  let [errorEventId, setErrorEventId] = useState()
  
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
  
  async function markWatched(seriesId, seasonNr, episodeNr, index) {
    
    const data = {
      seriesId: seriesId,
      seasonNr: seasonNr,
      episodeNr: episodeNr,
      userId: user.sub
    }

    await fetch('/.netlify/functions/episodesMarkWatched', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      .then(handleErrors)
      .catch(err=>{
        console.log("Error while markAsWatched: show "+seriesId+": season: "+seasonNr+" episode: "+episodeNr+" "+JSON.stringify(err))
        reportError(err)
        setError(true)
      })

    setLastWatchedEpisode(index)
    setShowMarkAsWatchedAlert(true)
  }
  
  let [episodeListLoading, setEpisodeListLoading] = useState(false)
  let [episodesList, setEpisodesList] = useState([])

  // this is true if we open a page for a show that we are not subscribed to
  let [showNotAdded, setShowNotAdded] = useState(false)
  
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
    const report = async (err)=>{
      var eventId = await reportError(err)
      setErrorEventId(eventId)
    }

    setEpisodeListLoading(true)
    Promise.all([getUserSeries(), getEpisodes()])
      .then(function ([userSeriesRes, episodesRes]) {
        if (userSeriesRes.data.data.length < 1){
          setEpisodeListLoading(false)
          setShowNotAdded(true)
        } else if (userSeriesRes.data.data.length > 1){
          throw new Error("userSeries found > 1 result for seriesId "+seriesId+" and user "+user.sub+": "+userSeriesRes.data.data)
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
      .catch(err=>{
        console.log("Error while loading userSeries and episodes: "+err.name+" "+err.message)
        report(err)
        setError(true)
      })
    // eslint-disable-next-line
  }, [seriesId, user.sub, lastWatchedEpisode])

  return (
    hasError ? <ErrorComponent eventId={errorEventId} />:
    <div>
      <div>
        <Link to="/">
          <button>Go back</button>
        </Link>
      </div>
        {showNotAdded ? <p>This show is not linked to your account.</p>
        :
        <div>
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
        }
    </div>
  );
}

export default SeriesInfo;
