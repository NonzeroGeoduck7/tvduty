import PropTypes from 'prop-types'
import React from 'react'
import { Link } from "react-router-dom"


function SeriesElement(props) {
	
	function func(text) {
		console.log("func: "+text)
	}
	
  	return (
	  	<div>
		  	<div>
				<Link to={"/series/"+props.extId}>
					<img height={props.width*4/3} width={props.width}
						src={props.poster}
						alt={'poster_' + props.title}
						onClick={() => func(props.title)}
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
  poster: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired,
}

export default SeriesElement
