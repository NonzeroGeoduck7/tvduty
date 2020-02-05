import React, { useState, useEffect } from 'react'
import { timeDiff } from '../helper/helperFunctions'
import { handleErrors, reportError } from '../helper/sentryErrorHandling'
import { useAuth0 } from '../react-auth0-wrapper'
import Loading from './Loading'
import ErrorComponent from './ErrorComponent'

const EpisodesNewsList = React.memo(function EpisodesNewsList() {
    
    const { user } = useAuth0()

    let [hasError, setError] = useState(false)
    let [errorEventId, setErrorEventId] = useState()

    let [episodeNewsLoading, setEpisodeNewsLoading] = useState(false)
    let [episodeNewsList, setEpisodeNewsList] = useState([])

    let [maxNumberUpcomingEpisodes, setMaxNumberUpcomingEpisodes] = useState(2)
    let [maxNumberAiredEpisodes, setMaxNumberAiredEpisodes] = useState(3)

    const userSub = user && user.sub
    useEffect(()=>{

        const report = async (err)=>{
            var eventId = await reportError(err)
            setErrorEventId(eventId)
        }

        setEpisodeNewsLoading(true)

        const data = {
            userId: user ? user.sub : ''
        }

        fetch('/.netlify/functions/episodesNewsRead', {
            method: 'POST',
            body: JSON.stringify(data)
        })
        .then(handleErrors)
        .then(res => res.json())
        .then(response => {
          setEpisodeNewsList(response.data)
          setEpisodeNewsLoading(false)
        })
        .catch(err => {
            console.log('Error while processing result from episodesNewsRead: ', err)
            report(err)
            setError(true)
        })

    }, [user, userSub])

    
    const episodesUpcomingNewsList = episodeNewsList.filter(r=>new Date(r.airstamp) >= Date.now()).reverse()
    const maxEpUpcomingArray = episodesUpcomingNewsList.length
    const episodesAiredNewsList = episodeNewsList.filter(r=>new Date(r.airstamp) < Date.now())
    const maxEpAiredArray = episodesAiredNewsList.length
    return (
        hasError ? <ErrorComponent eventId={errorEventId} />:
        episodeNewsLoading?<Loading/>:
		<div>
			<p>upcoming:</p>
            {episodesUpcomingNewsList.slice(0,maxNumberUpcomingEpisodes).map(
                (row, i)=>
                    <div key={i}>
                        <p>
                            In {timeDiff(new Date(row.airstamp),new Date())}: {row.airstamp} - {row.series} - {row.title}
                        </p>
                    </div>
            )}
            {maxNumberUpcomingEpisodes < maxEpUpcomingArray ?
                <button onClick={()=>setMaxNumberUpcomingEpisodes(maxNumberUpcomingEpisodes+3)}>extend</button>
                :
                <p>no more episodes scheduled. Some episodes might not be announced at this point.</p>
            }
            <br/>
            
            <p>available:</p>
            {episodesAiredNewsList.slice(0,maxNumberAiredEpisodes).map(
                (row, i)=>
                    <div key={i}>
                        <p>
                        {timeDiff(new Date(row.airstamp),new Date())} ago: {row.airstamp} - {row.series} - {row.title}
                        </p>
                    </div>
            )}
            {maxNumberAiredEpisodes < maxEpAiredArray ?
                <button onClick={()=>setMaxNumberAiredEpisodes(maxNumberAiredEpisodes+3)}>extend</button>
                :
                <p>no more episodes aired during the last month</p>
            }
        </div>
  	)
})

export default EpisodesNewsList
