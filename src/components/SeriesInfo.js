// src/components/SeriesInfo.js

import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import Loading from './Loading'
import DataTable from 'react-data-table-component'
import moment from 'moment'
import { useAuth0 } from "../react-auth0-wrapper"
import { seasonEpisodeNotation } from "../helper/helperFunctions"
import { LazyLoadImage } from 'react-lazy-load-image-component'
import EpisodePlaceholder from '../img/placeholder.png';
import { getWindowDimensions } from "../helper/helperFunctions"

function SeriesInfo ({ match }) {
  const { user } = useAuth0();
  let [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const columns = [
    {
      name: 'Status',
      selector: 'index',
      sortable: true,
      cell: (data) => <div>{data.watched ? "watched":"not watched"}</div>,
      width: '15%',
      resizable: true,
    },
    {
      name: 'Number',
      selector: 'seasonEpisodeNotation',
      sortable: true,
      width: '10%',
    },
    {
      name: 'Title',
      selector: 'title',
      sortable: true,
      width: '40%',
    },
    {
      name: 'Airdate',
      selector: 'airstamp',
      sortable: true,
      format: d => moment(d.airstamp).format('llll'),
      width: '20%',
      resizable: true,
    },
    {
      name: 'watched',
      cell: (data) => <button onClick={()=>markWatched(data.seriesId, data.seasonNr, data.episodeNr)}>&#10004;</button>,
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
  let imageWidth = Math.min(1280,width - 20)
  const ExpandedComponent = ({ data }) => (
    <div>
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
  
  async function markWatched(seriesId, seasonNr, episodeNr) {
    console.log("mark episode " + seasonNr + "x" + episodeNr + " as watched for user " + user.sub)
    
    await postAPI('episodesMarkWatched', {seriesId: seriesId, seasonNr: seasonNr, episodeNr: episodeNr, userId: user.sub})
      .then(response => {
        console.log("response from episodeWatched: " + response.msg)
      })
      .catch(err => console.log('episodeWatched API error: ', err))
  }

  
  let [episodeListLoading, setEpisodeListLoading] = useState(false)
  let [episodesList, setEpisodesList] = useState([])
  let [series, setSeries] = useState([])
  
  const { params: { extId:seriesId } } = match
  
  useEffect(() => {
    console.log("useEffect method completed, showsInfo updated.")

    /*
    fetch('/.netlify/functions/userSeriesRead?seriesId='+seriesId+'?userId='+user.sub)
  	.then(res => res.json())
  	.then(response => {
  	  setSeries(response.data)
  	})
    .catch(err => console.log('Error retrieving series: ', err))
    */

   // TODO: check here if user has tracked this series.
  
    // Fetch the Episodes from the database
    setEpisodeListLoading(true);
    fetch('/.netlify/functions/episodesRead?seriesId='+seriesId)
  	.then(res => res.json())
  	.then(response => {
      let size = response.data.length
      setEpisodesList(response.data.map(function(entry, idx){
        entry.seasonEpisodeNotation = seasonEpisodeNotation(entry.seasonNr, entry.episodeNr)
        entry.index=idx
        entry.watched=idx > size - 0 // TODO: read currentEpisode value from userSeriesRead
        // careful, inverted list, look at ordering in episodesRead
        return entry
      }))
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
        seriesId: {seriesId}<br/>
        red = Episode not out yet
      <div>
        {"Series: "+JSON.stringify(series)}
      </div>
      {episodeListLoading ? <Loading /> :
        <DataTable
          title="Episode List"
          columns={columns}
          data={episodesList}
          conditionalRowStyles={conditionalRowStyles}
          expandableRows
          highlightOnHover
          expandOnRowClicked
          expandableRowsComponent={<ExpandedComponent />}
        />
      }
    </div>
  );
}

export default SeriesInfo;
