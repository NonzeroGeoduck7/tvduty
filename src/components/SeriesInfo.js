// src/components/SeriesInfo.js

import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import Loading from './Loading'
import DataTable from 'react-data-table-component';
import moment from 'moment';
import { useAuth0 } from "../react-auth0-wrapper";

function SeriesInfo ({ match }) {
  const { user } = useAuth0();

  const columns = [
    {
      name: 'Status',
      selector: 'index',
      sortable: true,
      cell: (data) => <p>{data.watched ? "watched":"not watched"}</p>,
    },
    {
      name: 'Season',
      selector: 'seasonNr',
      sortable: true,
      maxWidth: '20px',
    },
    {
      name: 'Episode',
      selector: 'episodeNr',
      sortable: true,
      maxWidth: '20px',
    },
    {
      name: 'Title',
      selector: 'title',
      sortable: true,
    },
    {
      name: 'Airdate',
      selector: 'airstamp',
      sortable: true,
      format: d => moment(d.airstamp).format('llll'),
    },
    {
      name: 'watched',
      cell: (data) => <button onClick={()=>markWatched(data.seriesId, data.seasonNr, data.episodeNr)}>&#10004;</button>,
      maxWidth: '30px',
    },
  ]
  
  const ExpandedComponent = ({ data }) => (
    <div>
      <img src={data.image} height={400} alt={'img_'+data.index} />
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
      setEpisodesList(response.data.map(function(entry, idx){
        entry.index=idx
        entry.watched=idx < 5 // TODO: read currentEpisode value from userSeriesRead
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
      seriesId: {seriesId}
      <div>
        {"Series: "+JSON.stringify(series)}
      </div>
      {episodeListLoading ? <Loading /> :
        <DataTable
          title="Episode List"
          columns={columns}
          data={episodesList}
          expandableRows
          highlightOnHover
          expandableRowsComponent={<ExpandedComponent />}
          expandOnRowClicked
        />
      }
    </div>
  );
}

export default SeriesInfo;
