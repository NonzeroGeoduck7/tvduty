import PropTypes from 'prop-types';
import React from 'react';

function SeriesElement(props) {
  return (
	  <div>
        <img width={300} src={props.poster} alt={'poster_' + props.title}  />
	  </div>
  );
}

SeriesElement.propTypes = {
  title: PropTypes.string.isRequired,
  poster: PropTypes.string.isRequired
};

export default SeriesElement;
