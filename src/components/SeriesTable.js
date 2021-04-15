// SeriesTable.js
import React, { useState, useEffect } from 'react'
import SeriesElement from './SeriesElement'
import EpisodeNewsList from './EpisodesNewsList'
import IpInfoComponent from './IpInfoComponent'
import ErrorComponent from './ErrorComponent'
import Loading from './Loading'
import { Link } from 'react-router-dom'
import { trackWindowScroll } from 'react-lazy-load-image-component'
import KeyboardEventHandler from 'react-keyboard-event-handler';
import styled from 'styled-components'
import SweetAlert from 'react-bootstrap-sweetalert'

import { useAuth0 } from '../react-auth0-wrapper'
import { getWindowDimensions } from '../helper/helperFunctions'
import { handleErrors, reportError } from '../helper/sentryErrorHandling'

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
`

const DeleteButton = styled.button`
    position: relative;
    top: -5px;
    right: -5px;
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
    top: -5px;
`

const StyledDiv = styled.div`
    margin: 20px 20px 20px 20px;
    padding: 10px;
    border: 2px solid palevioletred;
    border-radius: 3px;
`

function SeriesTable(props) {

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

    
    async function handleSeriesDelete(seriesId, userId) {
        const data = {
            seriesId: seriesId,
            userId: userId
        }

        await fetch('/.netlify/functions/seriesDelete', {
            method: 'POST',
            body: JSON.stringify(data)
        })
        .then(handleErrors)
        .catch(err => {
            console.log('Error while processing result from SeriesRead: ', err)
            reportError(err)
            setError(true)
        })
    }

    let [hasError, setError] = useState(false)
    let [errorEventId, setErrorEventId] = useState()

    let [deleteMode, setDeleteMode] = useState(false)
    let [showIdToDelete, setShowIdToDelete] = useState(0)
    let [showDeletedAlert, setShowDeletedAlert] = useState(false)
    let [showDeleteSuccess, setShowDeleteSuccess] = useState(false)

    let [seriesList, setSeriesList] = useState([])
    let [originalSeriesList, setOriginalSeriesList] = useState([])
    let [seriesListLoading, setSeriesListLoading] = useState(false)
    let [searchString, setSearchString] = useState('')

    const { user } = useAuth0()

    const userSub = user && user.sub
    useEffect(() => {
        
        function componentDidRecover() {
            console.log('component recovered')
            // do something
        }

        props.cacheLifecycles.didRecover(componentDidRecover)

        const report = async (err)=>{
            var eventId = await reportError(err)
            setErrorEventId(eventId)
        }
      
        setSeriesListLoading(true)

        // Fetch the Series from the database
        const data = {
            userId: user ? user.sub : ''
        }

        fetch('/.netlify/functions/seriesRead', {
            method: 'POST',
            body: JSON.stringify(data)
        })
        .then(handleErrors)
        .then(res => res.json())
        .then(response => {
          setSeriesList(response.data)
          setOriginalSeriesList(response.data)
          setSeriesListLoading(false)
        })
        .catch(err => {
            console.log('Error while processing result from SeriesRead: ', err.name, err.message)
            report(err)
            setError(true)
        })
        // eslint-disable-next-line
    }, [user, userSub,])

    useEffect(() => {
        setSeriesList(originalSeriesList.filter(s=>s.title.toLowerCase().includes(searchString)))
        // eslint-disable-next-line
    }, [searchString])

    const { width } = getWindowDimensions()

    // at least 2 items next to each other, and at max 10 items next to each other, minus some pixels for the vertical scrollbar, if any.
    const columnWidth = Math.min((width-100)/2, Math.max(330, (width-100)/10))

    const numOfElements = parseInt(width / columnWidth)

    // group for each line
    var seriesListGrouped = []
    var idx = 0
    var tmp = []
    //for (var s in seriesList){
    seriesList.forEach(function(s){
        if (idx < numOfElements){
            tmp.push(s)
            idx += 1
        } else {
            seriesListGrouped.push(tmp)
            tmp = []
            idx = 0
        }
    })

    function renderElement(c){
        var numWatchedEpisodes = c.userseries.numWatchedEpisodes

        return <SeriesElement
            isDeleteMode={deleteMode}
            nextEpisodeAirstamp={c.nextEpisodeAirstamp}
            nextEpisodeNotation={c.nextEpisodeNotation}
            deleteFunction={()=>{setShowIdToDelete(c.extId);setShowDeletedAlert(true)}}
            key={c.extId}
            width={columnWidth/1.25}
            numWatchedEpisodes={numWatchedEpisodes}
            nrOfEpisodes={c.nrOfAiredEpisodes}
            title={c.title}
            poster={c.poster}
            extId={c.extId}
            status={c.status}
        />
        //return <div><p>{JSON.stringify(c)}</p></div>
    }

    return (
        <WrapperDiv>
            <IpInfoComponent />
            
            <div style={{"textAlign": "center"}}>
                <Link to="/add">
                    <Button>Add new series</Button>
                </Link>
            </div>

            <StyledDiv>
                <EpisodeNewsList />
            </StyledDiv>

            <StyledDiv>
                {hasError ? <ErrorComponent eventId={errorEventId} />:
                seriesListLoading ? <Loading /> :
                    <div>
                        <SearchStringDiv>
                            { searchString &&
                                <SearchString>{`filtered to titles containing: '${searchString}', press ESC to remove the filter.`}</SearchString>
                            }
                        </SearchStringDiv>
                        <DeleteButtonDiv>
                            <DeleteButton onClick={()=>setDeleteMode(!deleteMode)}>delete shows</DeleteButton>
                        </DeleteButtonDiv>
                        {/*<StackGrid columnWidth={columnWidth}>*/}
                            {seriesListGrouped.map(e => 
                                <div key={e[0].extId} style={{"display": "inline-block", "width": 100/numOfElements+"%"}}>
                                    {e.map(c => renderElement(c)
                                    )}
                                </div>)
                            }
                        {/*</StackGrid>*/}
                    </div>
                }
            </StyledDiv>
            {showDeletedAlert &&
                <SweetAlert
                    warning
                    showCancel
                    confirmBtnText="Yes, delete it!"
                    confirmBtnBsStyle="danger"
                    title="Are you sure?"
                    onConfirm={async()=>await handleSeriesDelete(showIdToDelete, user.sub).then(()=>{setShowDeleteSuccess(true);setShowDeletedAlert(false)})}
                    onCancel={()=>setShowDeletedAlert(false)}
                    focusCancelBtn
                >
                    Delete show {showIdToDelete} from your account?
                </SweetAlert>
            }
            {showDeleteSuccess && 
                <SweetAlert success title="Success!" onConfirm={()=>setShowDeleteSuccess(false)} onCancel={()=>setShowDeleteSuccess(false)}>
                    Series successfully deleted, reload page to see the effect!
                </SweetAlert>}
            <KeyboardEventHandler
                handleKeys={['alphanumeric', 'space', 'backspace', 'esc']}
                isExclusive={true}
                onKeyEvent={(key, e) => handleKeyPress(key)} />
        </WrapperDiv>
    )
}

export default trackWindowScroll(SeriesTable)