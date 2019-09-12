import PropTypes from 'prop-types';
import React from 'react';
import { Link } from "react-router-dom";


function SeriesElement(props) {
	
  function func(text) {
  	console.log("func: "+text)
  }
  
  return (
	  <div>
	    <Link to={"/series/"+props.extId}>
          <img width={300}
	  		 src={props.poster}
	         alt={'poster_' + props.title}
	  		 onClick={() => func(props.title)}
	      />
	  	</Link>
	  </div>
  );
}

SeriesElement.propTypes = {
  title: PropTypes.string.isRequired,
  poster: PropTypes.string.isRequired
};

export default SeriesElement;
