// SeriesTable.js
import React, { useState, useEffect } from 'react'
import SeriesElement from './SeriesElement'
import Loading from './Loading'
import { Link } from 'react-router-dom'
import StackGrid from 'react-stack-grid'
import { trackWindowScroll } from 'react-lazy-load-image-component'
import * as Sentry from '@sentry/browser'
import KeyboardEventHandler from 'react-keyboard-event-handler';

import { useAuth0 } from '../react-auth0-wrapper'
import { getWindowDimensions } from '../helper/helperFunctions'


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

    const { user } = useAuth0()
    useEffect(() => {
        function handleResize() {
          setWindowDimensions(getWindowDimensions())
        }

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
        <div>
            <p>Screen size: {width} x {height}</p>

            <Link to="/add">
                <button>&#43;</button>
            </Link>

            { searchString &&
            <p>filtered to titles containing: '{searchString}', press ESC to remove the filter.</p>
            }

            {seriesListLoading ? <Loading /> :
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
            }
            <KeyboardEventHandler
                handleKeys={['alphanumeric', 'space', 'backspace', 'esc']}
                isExclusive={true}
                onKeyEvent={(key, e) => handleKeyPress(key)} />
        </div>
        
    )
}

export default trackWindowScroll(SeriesTable)