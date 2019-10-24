// SeriesTable.js
import React, { useState, useEffect } from 'react'
import SeriesElement from './SeriesElement'
import Loading from './Loading'
import { Link } from "react-router-dom"
import StackGrid from "react-stack-grid"
import { trackWindowScroll } from 'react-lazy-load-image-component';

import { useAuth0 } from "../react-auth0-wrapper"
import * as Sentry from '@sentry/browser';

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window
    return {
        width,
        height
    }
}

function SeriesTable(scrollPosition) {
    
    let [seriesList, setSeriesList] = useState([])
    let [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())
    let [seriesListLoading, setSeriesListLoading] = useState(false)

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
          setSeriesListLoading(false)
        })
        .catch(err => console.log('Error retrieving products: ', err))
    }, [user.sub])
    
    const { width, height } = windowDimensions

    // at least 2 items next to each other, and at max 10 items next to each other, minus some pixels for the vertical scrollbar, if any.
    const columnWidth = Math.min((width-40)/2, Math.max(330, (width-40)/10))

    return (
        <div>
            <p>Screen size: {width} x {height}</p>

            <Link to="/add">
                <button>&#43;</button>
            </Link>

            {seriesListLoading ? <Loading /> :
                <StackGrid columnWidth={columnWidth}>
                    {seriesList.map(c => 
                        <SeriesElement
                            scrollPosition={scrollPosition}
                            key={c.extId}
                            width={columnWidth/1.25}
                            currentEpisode={c.userseries[0].currentEpisode}
                            nrOfEpisodes={c.nrOfEpisodes}
                            title={c.title}
                            poster={c.poster}
                            extId={c.extId} />
                    )}
                </StackGrid>
            }
        </div>
    )
}

export default trackWindowScroll(SeriesTable)