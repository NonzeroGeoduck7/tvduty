// SeriesTable.js
import React, { useState, useEffect } from 'react'
import SeriesElement from './SeriesElement'
import Loading from './Loading'
import { Link } from 'react-router-dom'
import StackGrid from 'react-stack-grid'
import { trackWindowScroll } from 'react-lazy-load-image-component'
import * as Sentry from '@sentry/browser'
import KeyboardEventHandler from 'react-keyboard-event-handler';
import styled from 'styled-components'

import { useAuth0 } from '../react-auth0-wrapper'
import { getWindowDimensions } from '../helper/helperFunctions'
import { getIpInformation } from '../api/ipLookup'

const WrapperDiv = styled.div`

`// background: #e6e6ff;

const Button = styled.button`
    background: white;
    color: palevioletred;
    font-size: 1em;
    margin: 1em;
    padding: 0.5em 2em;
    border: 2px solid palevioletred;
    border-radius: 3px;
`

const DeleteButtonDiv = styled.div`
    text-align: right;
    display: inline-block;
    width: 50%;
    marginTop: -20;
`

const DeleteButton = styled.button`
    position: relative;
    top: -20px;
    right: -20px;
    background: white;
    color: palevioletred;
    font-size: 0.7em;
    padding: 0.2em 0.8em;
    border: 2px solid palevioletred;
    border-radius: 3px;
`

const SearchStringDiv = styled.div`
    text-align: left;
    display: inline-block;
    width: 50%;
`

const SearchString = styled.p`
    position: relative;
    top: -20px;
`

const StyledDiv = styled.div`
    margin: 20px 20px 20px 20px;
    padding: 30px;
    border: 2px solid palevioletred;
    border-radius: 3px;
`

const IpInfoDiv = styled.div`
    font-size: 12px;
    text-align: center;
    color: light-blue;
`

function SeriesTable(scrollPosition) {

    function handleKeyPress(key){
        switch(key) {
            case "esc":
                setSearchString('')
                break
            case "backspace":
                setSearchString(searchString.substr(0,Math.max(0,searchString.length-1)))
                break
            case "space":
                setSearchString(searchString+' ')
                break
            default:
                setSearchString(searchString + key)
                break
        }
    }

    let [seriesList, setSeriesList] = useState([])
    let [originalSeriesList, setOriginalSeriesList] = useState([])
    let [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())
    let [seriesListLoading, setSeriesListLoading] = useState(false)
    let [searchString, setSearchString] = useState('')
    let [ipInfo, setIpInfo] = useState({})

    const { user } = useAuth0()
    useEffect(() => {
        function handleResize() {
          setWindowDimensions(getWindowDimensions())
        }

        getIpInformation().then((res)=>{
            setIpInfo(res)
        })

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // replaces componentDidMount -> reload when user.sub changes
    useEffect(() => {
        console.log("useEffect method completed, showsTable updated.")
      
        setSeriesListLoading(true)

        // Fetch the Series from the database
        fetch('/.netlify/functions/seriesRead')
        .then(res => res.json())
        .then(response => {
          let filtered = response.data.filter(e=>e.userseries.filter(e1=>e1.userId===user.sub).length > 0)
          setSeriesList(filtered)
          setOriginalSeriesList(filtered)
          setSeriesListLoading(false)
        })
        .catch(err => console.log('Error retrieving products: ', err))
    }, [user.sub])

    useEffect(() => {
        setSeriesList(originalSeriesList.filter(s=>s.title.toLowerCase().includes(searchString)))
    }, [searchString])

    const { width, height } = windowDimensions

    // at least 2 items next to each other, and at max 10 items next to each other, minus some pixels for the vertical scrollbar, if any.
    const columnWidth = Math.min((width-40)/2, Math.max(330, (width-40)/10))

    return (
        <WrapperDiv>
            <IpInfoDiv>{ipInfo?`Your IP is ${ipInfo.ip} and points to ${ipInfo.postal} ${ipInfo.city}, ${ipInfo.country}. Organization: ${ipInfo.org}`
                        :'IP information not available'}
            </IpInfoDiv>
            
            <div style={{"textAlign": "center"}}>
                <Link to="/add">
                    <Button>Add new series</Button>
                </Link>
            </div>

            {seriesListLoading ? <Loading /> :
                <StyledDiv>
                    <SearchStringDiv>
                        { searchString &&
                            <SearchString>{`filtered to titles containing: '${searchString}', press ESC to remove the filter.`}</SearchString>
                        }
                    </SearchStringDiv>
                    <DeleteButtonDiv>
                        <DeleteButton>delete shows</DeleteButton>
                    </DeleteButtonDiv>
                    <StackGrid columnWidth={columnWidth}>
                        {seriesList.map(c => {
                            var lastWatchedEpisode = -1
                            const userSeriesEntry = c.userseries.filter(entry=>entry.userId===user.sub)
                            if (userSeriesEntry.length === 1){
                                lastWatchedEpisode = userSeriesEntry[0].lastWatchedEpisode
                            } else {
                                Sentry.captureMessage("Error, more than one user - series pair for series '"+c.title+"' with id "+c.extId)
                            }
                            return <SeriesElement
                                scrollPosition={scrollPosition}
                                key={c.extId}
                                width={columnWidth/1.25}
                                lastWatchedEpisode={lastWatchedEpisode}
                                nrOfEpisodes={c.nrOfEpisodes}
                                title={c.title}
                                poster={c.poster}
                                extId={c.extId} />
                        })}
                    </StackGrid>
                </StyledDiv>
            }
            <KeyboardEventHandler
                handleKeys={['alphanumeric', 'space', 'backspace', 'esc']}
                isExclusive={true}
                onKeyEvent={(key, e) => handleKeyPress(key)} />
        </WrapperDiv>
        
    )
}

export default trackWindowScroll(SeriesTable)