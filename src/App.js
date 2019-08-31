import React, { Component } from 'react'
import {Helmet} from "react-helmet";
import './App.css';

import SeriesTable from './components/SeriesTable'

export default class App extends Component {
  render() {
    return (
      <div>
		<Helmet
		
            script={[{ 
			  type: 'text/javascript', 
		      innerHTML: '(function(d, t) {var g = d.createElement(t),s = d.getElementsByTagName(t)[0];g.src = "https://cdn.pushalert.co/integrate_8927437e76ea83afc8a090882ab0a679.js";                        s.parentNode.insertBefore(g, s);}(document, "script"))' 
			}]} 
		
		/>
	  
        <SeriesTable />
      </div>
    )
  }
}
