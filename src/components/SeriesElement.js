import PropTypes from 'prop-types';
import React from 'react';



function SeriesElement(props) {
	
  function func(text) {
  	console.log("func: "+text)
  }
  
  return (
	  <div key={props.key}>
	  	<a href="/">
        <img width={300}
	  		 src={props.poster}
	         alt={'poster_' + props.title}
	  		 onClick={() => func(props.title)}
	    />
		</a>
	  </div>
  );
}

SeriesElement.propTypes = {
  title: PropTypes.string.isRequired,
  poster: PropTypes.string.isRequired
};

export default SeriesElement;
