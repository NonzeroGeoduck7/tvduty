import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import placeholder from '../img/placeholder.png'
import posed from 'react-pose'
import styled from 'styled-components'
import DeleteOverlayImage from '../img/delete.png'

import 'react-lazy-load-image-component/src/effects/blur.css';
import { timeDiff } from '../helper/helperFunctions'

const ProgressDiv = styled.div`
	background: green;
	display: inline-block;
	vertical-align: bottom;
	width: 4px;
	height: ${props => props.height};
`

const NextEpisodeDiv = styled.button`
	background: white;
    color: red;
    font-size: 0.8em;
    padding: -0.2em 0.8em;
    border: 2px solid ${props => props.color};
    border-radius: 3px;
`

const SeriesElement = React.memo(function SeriesElement(props) {
	
	let [showProgressBar, setShowProgressBar] = useState(false)

	const Hoverable = posed.div({
		hoverable: true,
		init: {
		  scale: 1,
		  boxShadow: '0px 0px 0px rgba(0,0,0,0)'
		},
		hover: {
		  scale: 1.1,
		  boxShadow: '0px 5px 10px rgba(0,0,0,0)'
		},
	})

	// this is the progress for all episodes not the ones that aired...
	var watchPercentage = parseFloat(100*(props.numWatchedEpisodes)/props.nrOfEpisodes).toFixed(0)
	
	var nextEpisodeText = ""
	if (watchPercentage - 100 < 5e-5 && props.nextEpisodeNotation!=null && props.nextEpisodeAirstamp!=null){
		nextEpisodeText = ""
			+ "next: "+props.nextEpisodeNotation
			+ " ("+new Date(props.nextEpisodeAirstamp).toLocaleDateString()+")"
			+ ", in "+timeDiff(props.nextEpisodeAirstamp, new Date())
	}

	return (
		<div style={{'textAlign': 'center'}}>
			<Hoverable>

				<Link to={{pathname: "/series/"+props.extId, state: {title: props.title, poster: props.poster}}}>
					<NextEpisodeDiv color={props.status === 'Ended'?"red":nextEpisodeText!=""?"blue":"green"}>
						{nextEpisodeText}
					</NextEpisodeDiv>
				</Link>
				<div style={{"paddingTop": 3}}>
					{showProgressBar&&<ProgressDiv height={`${watchPercentage*props.width*4/3/100}px`}/>}
					
					{props.isDeleteMode && <img onClick={props.deleteFunction} src={DeleteOverlayImage} alt={props.title+" delete"} style={{"width":props.width*4/5,"position":"absolute", "zIndex":1}} />}
					
					<Link to={{pathname: "/series/"+props.extId, state: {title: props.title, poster: props.poster}}}>
						<LazyLoadImage
							afterLoad={()=>{setShowProgressBar(true)}}
							scrollPosition={props.scrollPosition}
							height={props.width*4/3} width={props.width}
							placeholderSrc={placeholder}
							effect="blur"
							src={props.poster}
						/>
					</Link>
					{showProgressBar&&<ProgressDiv height={`${watchPercentage*props.width*4/3/100}px`}/>}
				</div>
			</Hoverable>
			<div>
				<label>
					{props.title}
				</label>
			</div>
		</div>
  	)
})

SeriesElement.propTypes = {
  title: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
}

export default SeriesElement
