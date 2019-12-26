import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import placeholder from '../img/placeholder.png'
import posed from 'react-pose'
import styled from 'styled-components'

import 'react-lazy-load-image-component/src/effects/blur.css';

const ProgressDiv = styled.div`
	background: green;
	display: inline-block;
	vertical-align: bottom;
	width: 4px;
	height: ${props => props.height};
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
	var watchPercentage = parseFloat(100*(props.lastWatchedEpisode+1)/props.nrOfEpisodes).toFixed(0)
	var watchProgress = (props.lastWatchedEpisode+1) + '/' + props.nrOfEpisodes + ' (' +watchPercentage + '%)'
  	return (
		<div style={{'textAlign': 'center'}}>
			<Hoverable>
				{showProgressBar&&<ProgressDiv height={`${watchPercentage*props.width*4/3/100}px`}/>}
				<Link to={"/series/"+props.extId}>
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
			</Hoverable>
			<div>
				<label>
					{props.title} -> ep: {watchProgress}
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
