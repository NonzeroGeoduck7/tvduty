// SeriesTable.js
import React, { useState, useEffect } from 'react'
import SeriesElement from './SeriesElement'
import { Link } from "react-router-dom"
import StackGrid from "react-stack-grid"

import { useAuth0 } from "../react-auth0-wrapper"

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window
    return {
        width,
        height
    }
}

function SeriesTable() {
    
    let [seriesList, setSeriesList] = useState([])
    let [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())

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
      
        // Fetch the Series from the database
        fetch('/.netlify/functions/seriesRead')
        .then(res => res.json())
        .then(response => {
          let filtered = response.data.filter(e=>e.userseries.filter(e1=>e1.userId===user.sub).length > 0)
          setSeriesList(filtered)
        })
        .catch(err => console.log('Error retrieving products: ', err))
    }, [user.sub])
    
    const { width, height } = windowDimensions
    const columnWidth = 330

    return (
        <div>
            <p>Screen size: {width} x {height}</p>

            <Link to="/add">
                <button>&#43;</button>
            </Link>

            <StackGrid columnWidth={columnWidth}>
                {seriesList.map(c => 
                    <SeriesElement
                        key={c.extId}
                        width={columnWidth/1.25}
                        currentEpisode={c.userseries[0].currentEpisode}
                        title={c.title}
                        poster={c.poster}
                        extId={c.extId} />
                )}
            </StackGrid>
        </div>
    )
}

export default SeriesTable