import React from "react";

import SeriesElement from "./SeriesElement";

function SeriesList(props) {
  return (
    <div>
      {props.series.map(c => <SeriesElement key={c.extId} title={c.title} poster={c.poster} />)}
    </div> 
  ); 
} 

export default SeriesList;