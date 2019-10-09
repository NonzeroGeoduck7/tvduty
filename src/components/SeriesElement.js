import PropTypes from 'prop-types'
import React from 'react'
import { Link } from "react-router-dom"
import { LazyLoadImage } from 'react-lazy-load-image-component';
import placeholder from '../img/placeholder.png';

import 'react-lazy-load-image-component/src/effects/blur.css';

function SeriesElement(props) {
	
  	return (
	  	<div>
		  	<div>
				<Link to={"/series/"+props.extId}>
					<LazyLoadImage
						scrollPosition={props.scrollPosition}
						height={props.width*4/3} width={props.width}
						placeholderSrc={placeholder}
						effect="blur"
						src={props.poster}
					/>
	  			</Link>
			</div>
			<div>
				<label>
					{props.title} -> ep: {props.currentEpisode}/? ({props.currentEpisode/1}%)
				</label>
			</div>
		
	  	</div>
  	)
}

SeriesElement.propTypes = {
  title: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired,
}

export default SeriesElement
