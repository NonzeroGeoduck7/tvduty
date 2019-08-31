import React from "react";

// import the Contact component
import SeriesElement from "./SeriesElement";


function SeriesList(props) {
  return (
    <div>
      {props.series.map(c => <Series key={c.id} name={c.name} />)}
     </div> 
  ); 
} 

export default SeriesList;