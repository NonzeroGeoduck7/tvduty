// src/components/SeriesInfo.js

import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import Loading from './Loading'
import ErrorComponent from './ErrorComponent'
import EpisodeElement from './EpisodeElement'
import StackGrid from 'react-stack-grid'
import { useAuth0 } from "../react-auth0-wrapper"
import { seasonEpisodeNotation } from "../helper/helperFunctions"
import { LazyLoadImage } from 'react-lazy-load-image-component'
import EpisodePlaceholder from '../img/placeholder.png'
import SweetAlert from 'react-bootstrap-sweetalert'
import styled from 'styled-components'
import { handleErrors, reportError } from '../helper/sentryErrorHandling'

import { getWindowDimensions } from "../helper/helperFunctions"

const DivTitle = styled.div`
  font-size: 1.5em;
`

function SeriesInfo (props) {
  const { user } = useAuth0();

  let [hasError, setError] = useState(false)
  let [errorEventId, setErrorEventId] = useState()

  let [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())
  let [showMarkAsWatchedAlert, setShowMarkAsWatchedAlert] = useState(false)

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  async function markWatched(seriesId, seriesTitle, episodeId, seasonNr, episodeNr, bulk, index) {
    
    let episodesArray = []
    if (bulk){
      for(const e of episodesList){
        if (e.seasonNr < seasonNr || (e.seasonNr === seasonNr && e.episodeNr <= episodeNr)){
          episodesArray.push(e.extId)
        }
      }
    } else {
      episodesArray.push(episodeId)
    }

    let episodeNotation = seasonEpisodeNotation(seasonNr, episodeNr)

    const data = {
      seriesId: seriesId,
      seriesTitle: seriesTitle,
      episodesArray: JSON.stringify(episodesArray),
      episodeNotation: episodeNotation,
      userId: user.sub
    }

    await fetch('/.netlify/functions/episodesMarkWatched', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      .then(handleErrors)
      .then(()=>setTriggerRerender(!triggerRerender))
      .catch(async err=>{
        console.log("Error while markAsWatched: show "+seriesId+": season: "+seasonNr+" episode: "+episodeNr+" "+JSON.stringify(err))
        var eventId = await reportError(err)
        setErrorEventId(eventId)
        setError(true)
      })

    setShowMarkAsWatchedAlert(true)
  }

  async function unmarkWatched(seriesId, seriesTitle, extId, episodeNotation) {
    
    const data = {
      episodeId: extId,
      seriesId: seriesId,
      seriesTitle: seriesTitle,
      userId: user.sub,
      episodeNotation: episodeNotation
    }

    await fetch('/.netlify/functions/episodesUnmarkWatched', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      .then(handleErrors)
      .then(()=>setTriggerRerender(!triggerRerender))
      .catch(async err=>{
        console.log("Error while unmarkAsWatched: episodeId " + extId + ": " +JSON.stringify(err))
        var eventId = await reportError(err)
        setErrorEventId(eventId)
        setError(true)
      })

    setShowMarkAsWatchedAlert(true)
  }
  
  let [triggerRerender, setTriggerRerender] = useState(false)
  const [stackGrid, setStackGrid] = useState()

  let [episodeListLoading, setEpisodeListLoading] = useState(false)
  let [episodesList, setEpisodesList] = useState([])
  let [extendedEpisodes, setExtendedEpisodes] = useState([])

  // this is true if we open a page for a show that we are not subscribed to
  let [showNotAdded, setShowNotAdded] = useState(false)
  
  const { params: { extId:seriesId } } = props.match
  // series props
  const { title, poster } = props.location.state
  const { width } = windowDimensions

  function getUserSeries() {
    return fetch('/.netlify/functions/userSeriesRead', {
      method: 'POST',
      body: JSON.stringify({
        seriesId: seriesId,
        userId: user.sub
      })
    }).then(res=>res.json())
  }

  function getEpisodes() {
    return fetch('/.netlify/functions/episodesRead', {
      method: 'POST',
      body: JSON.stringify({
        seriesId: seriesId
      })
    }).then(res=>res.json())

  }

  function handleEpisodeElementOnClick(episodeId){
    if (extendedEpisodes.includes(episodeId)){
      setExtendedEpisodes(extendedEpisodes.filter(e=>e !== episodeId))
    } else {
      setExtendedEpisodes(extendedEpisodes.concat([episodeId]))
    }
  }

  useEffect(() => {
    const report = async (err)=>{
      var eventId = await reportError(err)
      setErrorEventId(eventId)
      setError(true)
    }

    setEpisodeListLoading(true)
    Promise.all([getUserSeries(), getEpisodes()])
      .then(function ([userSeriesRes, episodesRes]) {

        if (userSeriesRes.data.length < 1){
          setEpisodeListLoading(false)
          setShowNotAdded(true)
        } else if (userSeriesRes.data.length > 1){
          throw new Error("userSeries found > 1 result for seriesId "+seriesId+" and user "+user.sub+": "+userSeriesRes.data)
        } else {
          setEpisodesList(episodesRes.data.map(function(entry, idx){
            entry.seasonEpisodeNotation = seasonEpisodeNotation(entry.seasonNr, entry.episodeNr)
            entry.seriesTitle=title
            entry.index=idx
            entry.userepisodes = entry.userepisodes.filter(e=>e.userId === user.sub)
            entry.watched=entry.userepisodes.length > 0 ? entry.userepisodes[0].timeWatched : false
            return entry
          }))

          setEpisodeListLoading(false)
        }
      })
      .catch(err=>{
        console.log("Error while loading userSeries and episodes: "+err.name+" "+err.message)
        report(err)
      })
    // eslint-disable-next-line
  }, [seriesId, user.sub, triggerRerender])

  useEffect(() => {
    if (stackGrid) {
      stackGrid.updateLayout()
    }
  }, [extendedEpisodes])

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
          <DivTitle>
            {title}
          </DivTitle>
          <div style={{display:"flex"}}>
            <LazyLoadImage
              height={width/4*4/3} width={width/4}
              placeholderSrc={EpisodePlaceholder}
              effect="blur"
              src={poster}
            />
          </div>
          <br/>
          <div style={{color: 'green'}}>green = Episode already watched</div>
          <div style={{color: 'red'}}>red = Episode not out yet</div>
          <br/>
          {episodeListLoading ? <Loading /> :
            <div>
              <label>Next Episode:</label>
              {episodesList.filter(e=>!e.watched).slice(-1).map(e => {
                    return <EpisodeElement
                        markWatched={()=>markWatched(e.seriesId, e.seriesTitle, e.extId, e.seasonNr, e.episodeNr, false, e.index)}
                        markWatchedBulk={()=>markWatched(e.seriesId, e.seriesTitle, e.extId, e.seasonNr, e.episodeNr, true, e.index)}
                        unmarkWatched={()=>unmarkWatched(e.seriesId, e.seriesTitle, e.extId, e.seasonEpisodeNotation)}
                        key={e.extId}
                        extended={true}
                        imageWidth={width/3}
                        data={e}
                        />
                })}
              
              <div>
                <label>All Episodes:</label>
                <StackGrid columnWidth={width*4/5} gridRef={grid=>setStackGrid(grid)}>
                  {episodesList.map(e => {
                      return <EpisodeElement
                        markWatched={()=>markWatched(e.seriesId, e.seriesTitle, e.extId, e.seasonNr, e.episodeNr, false, e.index)}
                        markWatchedBulk={()=>markWatched(e.seriesId, e.seriesTitle, e.extId, e.seasonNr, e.episodeNr, true, e.index)}
                        unmarkWatched={()=>unmarkWatched(e.seriesId, e.seriesTitle, e.extId, e.seasonEpisodeNotation)}
                        key={e.extId}
                        extendFunction={()=>{handleEpisodeElementOnClick(e.extId)}}
                        extended={extendedEpisodes.includes(e.extId)}
                        imageWidth={width/3}
                        data={e}
                        />
                  })}
                </StackGrid>
              </div>
            }
              
            </div>
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
