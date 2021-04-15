import React, { useState, useEffect } from 'react'
import { timeDiff, seasonEpisodeNotation } from '../helper/helperFunctions'
import { handleErrors, reportError } from '../helper/sentryErrorHandling'
import { useAuth0 } from '../react-auth0-wrapper'
import Loading from './Loading'
import ErrorComponent from './ErrorComponent'
import Carousel from 'react-bootstrap/Carousel'

const EpisodesNewsList = React.memo(function EpisodesNewsList() {
    
    const { user } = useAuth0()

    let [hasError, setError] = useState(false)
    let [errorEventId, setErrorEventId] = useState()

    let [episodeNewsLoading, setEpisodeNewsLoading] = useState(false)
    let [episodeNewsList, setEpisodeNewsList] = useState([])

    let [maxNumberAiredEpisodes, setMaxNumberAiredEpisodes] = useState(3)

    const maxNumberUpcomingSeries = 5

    const [index, setIndex] = useState(0)

    const handleSelect = (selectedIndex, e) => {
        setIndex(selectedIndex);
    }

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
            console.log('Error while processing result from episodesNewsRead: ', JSON.stringify(err))
            report(err)
            setError(true)
        })

    }, [user, userSub])

    
    const episodesUpcomingNewsList = episodeNewsList.filter(r=>new Date(r.airstamp) >= Date.now()).reverse()
    var seriesUpcoming = {}
    episodesUpcomingNewsList.forEach(function(element){
        if (typeof(seriesUpcoming[element.series]) != 'undefined') {
            if (new Date(seriesUpcoming[element.series].airstamp) > new Date(element.airstamp)) {
                seriesUpcoming[element.series] = element
            }
        } else {
            seriesUpcoming[element.series] = element
        }
    })
    const seriesUpcomingValues = Object.keys(seriesUpcoming).map(function(key){
        return seriesUpcoming[key];
    });

    const episodesAiredNewsList = episodeNewsList.filter(r=>new Date(r.airstamp) < Date.now())
    var episodesAiredGroupByDate = {}
    episodesAiredNewsList.forEach(function(element){
        const timeDiffString = timeDiff(new Date(element.airstamp),new Date())
        if (typeof(episodesAiredGroupByDate[timeDiffString]) != 'undefined') {
            let tmpArr = episodesAiredGroupByDate[timeDiffString]
            tmpArr.push(element)
            episodesAiredGroupByDate[timeDiffString] = tmpArr
        } else {
            episodesAiredGroupByDate[timeDiffString] = [element]
        }
    })

    const maxEpAiredArray = episodesAiredNewsList.length
    return (
        hasError ? <ErrorComponent eventId={errorEventId} />:
        episodeNewsLoading?<Loading/>:
		<div style={{"height":"100%", "width":"100%", "display": "flex"}}>
            <div style={{"width":"60%"}}>
                <p>available:</p>
                {Object.keys(episodesAiredGroupByDate).slice(0,maxNumberAiredEpisodes).map(
                    (timeDiffString, i)=>
                        <div key={timeDiffString}>
                            <b>{timeDiffString} ago:</b>
                            {
                                episodesAiredGroupByDate[timeDiffString].map(
                                    (row, i)=>
                                        <div key={i}>
                                            <p><i>{row.series} {seasonEpisodeNotation(row.seasonNr, row.episodeNr)}:</i> {row.title}</p>
                                        </div>
                                )
                            }
                        </div>
                    )
                }
                {maxNumberAiredEpisodes < maxEpAiredArray ?
                    <button onClick={()=>setMaxNumberAiredEpisodes(maxNumberAiredEpisodes+3)}>show more</button>
                    :
                    <p>no more episodes aired during the last month</p>
                }
            </div>
            <div style={{"width":"40%"}}>
                <p>upcoming:</p>
                <Carousel activeIndex={index} onSelect={handleSelect}>
                    {seriesUpcomingValues.slice(0,maxNumberUpcomingSeries).map(
                        (row, i)=>
                            <Carousel.Item key={i}>
                                <div style={{"backgroundColor": "black"}}>
                                    <img
                                        className="d-block"
                                        style={{"display": "block", "marginLeft":"auto", "marginRight":"auto","maxWidth":"400px", "height":"300px"}}
                                        src={row.poster}
                                        alt={"slide no. "+i}
                                        />
                                    </div>
                                <Carousel.Caption>
                                <h3 style={{"backgroundColor":"grey"}}>{row.series}</h3>
                                <p style={{"backgroundColor":"grey"}}>In {timeDiff(new Date(row.airstamp),new Date())}</p>
                                </Carousel.Caption>
                            </Carousel.Item>
                    )}
                </Carousel>
            </div>
        </div>
  	)
})

export default EpisodesNewsList
