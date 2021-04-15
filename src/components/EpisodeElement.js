import PropTypes from 'prop-types'
import React from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import placeholder from '../img/placeholder.png'
import styled from 'styled-components'

import 'react-lazy-load-image-component/src/effects/blur.css';
import { getWeekday, htmlSanitize } from '../helper/helperFunctions'

import Dropdown from 'react-bootstrap/Dropdown'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'

const Wrapper = styled.div`
	background: #f5f7f9;
	border-top: 2px solid ${props => props.watched?"green":props.released?"#d8d8d8":"red"};
	border-left: 2px solid ${props => props.watched?"green":props.released?"#d8d8d8":"red"};
    margin-bottom: 10px;
	padding: 15px;
	display: flex;
	flex-direction: ${props => props.extended?"column":"row"};
	flex-align: space-between;
	width: 100%;
`

const MarkButtonsDiv = styled.div`
	text-align: right;
	width: 100%;
`

const EpisodeElement = React.memo(function SeriesElement(props) {

	function isEpisodeReleased(airstamp){
		return airstamp != null && new Date(airstamp)<new Date()
	}

	const episode = props.data

	const imageWidth = props.imageWidth
	return (
		<Wrapper watched={episode.watched} released={isEpisodeReleased(episode.airstamp)} extended={props.extended}>
			<div onClick={props.extendFunction} style={{width: '100%'}}>
				<p>{props.extended?"▲":"▼"} {episode.seasonEpisodeNotation}: {episode.title}</p>
			</div>
			{props.extended && 
				<div style={{display: 'flex'}}>
					<LazyLoadImage
						height={imageWidth*9/16} width={imageWidth}
						placeholderSrc={placeholder}
						effect="blur"
						src={episode.image}
					/>
					<div style={{paddingLeft: 10}}>
						{ isEpisodeReleased(episode.airstamp) ?
							<p>aired: {getWeekday(new Date(episode.airstamp))}, {new Date(episode.airstamp).toLocaleDateString()} at {new Date(episode.airstamp).toLocaleTimeString()}</p>
							:
							<p>will air: {getWeekday(new Date(episode.airstamp))}, {new Date(episode.airstamp).toLocaleDateString()} at {new Date(episode.airstamp).toLocaleTimeString()}</p>
						}
						{
							episode.summary == null?
								<p>no summary available</p>
							:
								htmlSanitize(episode.summary).replaceAll('<br/>', '<br />').replaceAll('<br>','<br />').split('<br />').map(function(line){
									return <p>{line}</p>
								}) 
						}
					</div>
				</div>
			}
			{isEpisodeReleased(episode.airstamp) &&
				<MarkButtonsDiv>
				{ !episode.watched ?
					<Dropdown as={ButtonGroup}>
						<Button variant="success" onClick={props.markWatched}>mark as watched</Button>

						<Dropdown.Toggle split variant="success" id="dropdown-split-basic" />

						<Dropdown.Menu alignleft={"true"}>
							<Dropdown.Item onClick={props.markWatchedBulk}>also mark all previous episodes as watched</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
					:
					<Dropdown as={ButtonGroup}>
					<Button variant="warning" onClick={props.unmarkWatched}>remove from watched</Button>
					</Dropdown>
				}
				</MarkButtonsDiv>
			}
		</Wrapper>
  	)
})

EpisodeElement.propTypes = {
  data: PropTypes.object.isRequired,
}

export default EpisodeElement
