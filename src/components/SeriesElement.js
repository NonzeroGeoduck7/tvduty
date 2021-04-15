import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import placeholder from '../img/placeholder.png'
import posed from 'react-pose'
import styled from 'styled-components'

import 'react-lazy-load-image-component/src/effects/blur.css';
import { timeDiff } from '../helper/helperFunctions'

const ProgressDiv = styled.div`
	background: green;
	display: inline-block;
	vertical-align: bottom;
	width: 4px;
	height: ${props => props.height};
`

const NextEpisodeDiv = styled.button`
	background: white;
    color: red;
	font-size: 0.8em;
	margin-bottom: 0.4em;
    padding: -0.2em 0.8em;
    border: 2px solid ${props => props.color};
	border-radius: 3px;
`

const OuterDiv = styled.div`
	position: relative;
	width: 100%;
`

/*
const InnerDivPlusOneButton = styled.div`
	position: absolute;
	right: -${props=>props.width/2 - 20}px;
	top: 2em;
	margin: 5px 5px 5px 5px;
	z-index: 2;
	width: 100%;
`
*/

/*
const PlusOneButton = styled.button`
	text-align: center;
	horizontal-align: right;
	background: none;
    color: palevioletred;
    font-size: 1.2em;
    border: 2px solid grey;
	border-radius: 3px;
`
*/

const InnerDivDeleteButton = styled.div`
	position: absolute;
	top: 2em;
	z-index: 3;
	width: 100%;
`

const DeleteButton = styled.button`
	text-align: center;
	background: white;
    color: palevioletred;
    font-size: 2em;
    border: 2px solid palevioletred;
	border-radius: 3px;
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
	var watchPercentage = parseFloat(100*(props.numWatchedEpisodes)/props.nrOfEpisodes).toFixed(0)
	
	var nextEpisodeText = ""
	if (props.nextEpisodeNotation!=null && props.nextEpisodeAirstamp!=null){
		nextEpisodeText = "next: "+props.nextEpisodeNotation

		if (new Date(props.nextEpisodeAirstamp).getDate() === new Date().getDate()){
			nextEpisodeText = nextEpisodeText + " (today)"
		} else {
			nextEpisodeText = nextEpisodeText + " ("+new Date(props.nextEpisodeAirstamp).toLocaleDateString()+")"
		}

		if (new Date(props.nextEpisodeAirstamp) > new Date()){
			nextEpisodeText = nextEpisodeText + ", in "+timeDiff(props.nextEpisodeAirstamp, new Date())
		} else {
			nextEpisodeText = nextEpisodeText + ", "+timeDiff(props.nextEpisodeAirstamp, new Date())+" ago"
		}
	}

	return (
		<div style={{'textAlign': 'center'}}>
			<Hoverable>
				<Link to={{pathname: "/series/"+props.extId}}>
					<NextEpisodeDiv color={props.status === 'Ended'?"red":nextEpisodeText!==""?"blue":"green"}>
						{nextEpisodeText}
					</NextEpisodeDiv>
				</Link>
				
				<OuterDiv>
					{showProgressBar&&<ProgressDiv height={`${watchPercentage*props.width*4/3/100}px`}/>}
					<Link to={{pathname: "/series/"+props.extId}}>
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
				</OuterDiv>
				
				{/*<InnerDivPlusOneButton width={props.width}>
					<PlusOneButton>
						{"+1"}
					</PlusOneButton>
				</InnerDivPlusOneButton>*/}
				<InnerDivDeleteButton>
					{props.isDeleteMode &&
						<DeleteButton
							onClick={props.deleteFunction}
							width={props.width}>
								{"remove"}
						</DeleteButton>}
				</InnerDivDeleteButton>
			</Hoverable>
			<div>
				<label>
					{props.title}
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
