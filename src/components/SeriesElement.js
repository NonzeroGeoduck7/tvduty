import PropTypes from 'prop-types'
import React from 'react'
import { Link } from "react-router-dom"
import { LazyLoadImage } from 'react-lazy-load-image-component';
import placeholder from '../img/placeholder.png';
import posed from 'react-pose';

import 'react-lazy-load-image-component/src/effects/blur.css';

const SeriesElement = React.memo(function SeriesElement(props) {
	
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
				<Link to={"/series/"+props.extId}>
					<LazyLoadImage
						scrollPosition={props.scrollPosition}
						height={props.width*4/3} width={props.width}
						placeholderSrc={placeholder}
						effect="blur"
						src={props.poster}
					/>
	  			</Link>
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
