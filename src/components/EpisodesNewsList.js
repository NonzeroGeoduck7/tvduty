import React, { useState, useEffect } from 'react'
import { timeDiff } from '../helper/helperFunctions'
import { useAuth0 } from '../react-auth0-wrapper'
import Loading from './Loading'

const EpisodesNewsList = React.memo(function EpisodesNewsList() {
    
    const { user } = useAuth0()

    let [episodeNewsLoading, setEpisodeNewsLoading] = useState(false)
    let [episodeNewsList, setEpisodeNewsList] = useState([])

    let [maxNumberUpcomingEpisodes, setMaxNumberUpcomingEpisodes] = useState(2)
    let [maxNumberAiredEpisodes, setMaxNumberAiredEpisodes] = useState(3)

    useEffect(()=>{
        setEpisodeNewsLoading(true)

        const data = {
            userId: user.sub
        }

        fetch('/.netlify/functions/episodesNewsRead', {
            method: 'POST',
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(response => {
          setEpisodeNewsList(response.data)
          setEpisodeNewsLoading(false)
        })
        .catch(err => console.log('Error retrieving episodesNewsList: ', err))

    }, [user.sub])

    
    const episodesUpcomingNewsList = episodeNewsList.filter(r=>new Date(r.airstamp) >= Date.now()).reverse()
    const maxEpUpcomingArray = episodesUpcomingNewsList.length
    const episodesAiredNewsList = episodeNewsList.filter(r=>new Date(r.airstamp) < Date.now())
    const maxEpAiredArray = episodesAiredNewsList.length
    return (episodeNewsLoading?<Loading/>:
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
                <p>no more episodes scheduled for the next 7 days</p>
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
