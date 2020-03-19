// seriesCreate.js
import mongoose from 'mongoose'
import db from './server'
import Log from './logModel'
import Series from './seriesModel'
import Episodes from './episodesModel'
import UserSeries from './userSeriesModel'
import { assureHttpsUrl, seasonEpisodeNotation } from '../helper/helperFunctions'
import { initSentry, catchErrors, reportError } from '../sentryWrapper'
initSentry()

import fetch from 'isomorphic-fetch'

exports.handler = catchErrors(async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  async function showLookup(seriesId) {
	  const API_ENDPOINT = 'https://api.tvmaze.com/shows/'
	  
	  if (typeof(seriesId) == "undefined"){
		  throw new Error('SeriesId is undefined.')
	  } else {
		  console.log('lookup series with id: ' + seriesId)
	  }
	  const result = await fetch(API_ENDPOINT+seriesId+'?embed=episodes')
	    .then(res =>res.json())
		.catch(err=>{throw err})
	  
	  return result
  }
  
  try {
	const data = JSON.parse(event.body)
	const seriesId = data.id
	const userId = data.userId

	let seriesTitle = ""
	
	var numSeriesInDb = await Series.countDocuments({extId: seriesId})
	if (numSeriesInDb < 1) {
		// series not yet in database
		const show = await showLookup(seriesId)
	
		const {name: title, image, status} = show

		let nextEpisodeAirstamp = null
		let nextEpisodeNotation = null

		const nextEpisodeUrl = show._links!=null?(show._links.nextepisode!=null?show._links.nextepisode.href:null):null
		
		let idNextEpisode = null
		if (nextEpisodeUrl != null) {
			var tmp = nextEpisodeUrl.lastIndexOf('/');
			idNextEpisode = nextEpisodeUrl.substring(tmp + 1);
		}

		// insert episodes
		let episodes = show._embedded.episodes

		var epsToInsert = []
		episodes.forEach(function(ep){
			epsToInsert.push({
				"title":ep.name,
				"extId":ep.id,
				"seasonNr":ep.season,
				"episodeNr":ep.number,
				"seriesId":seriesId,
				"image":ep.image!=null?assureHttpsUrl(ep.image.original):null,
				"airstamp":ep.airstamp,
				"runtime":ep.runtime,
				"summary":ep.summary
			})

			if (ep.id == idNextEpisode){
				nextEpisodeNotation = seasonEpisodeNotation(ep.season, ep.number)
				nextEpisodeAirstamp = ep.airstamp
			}
		})

		var series = {
			_id: mongoose.Types.ObjectId(),
			title: title,
			extId: seriesId,
			status: status,
			poster: image!=null?assureHttpsUrl(image.original):null,
			lastUpdated: new Date(),
			nextEpisodeAirstamp: nextEpisodeAirstamp,
			nextEpisodeNotation: nextEpisodeNotation
		}

		seriesTitle = title

		var today = new Date()
    	today.setHours(22,0,0,0)
		series.nrOfAiredEpisodes = epsToInsert.filter(e=>new Date(e.airstamp)<today).length

		await Series.create(series)
		await Episodes.insertMany(epsToInsert)

	} else {
		console.log(`series with id ${seriesId} already in database, skipped.`)
	}
    
	var userSeriesInDb = await UserSeries.countDocuments({userId: userId, seriesId: seriesId})
	if (userSeriesInDb < 1) {
		const userSeries = {
			_id: mongoose.Types.ObjectId(),
			userId: userId,
			seriesId: data.id,
			lastWatchedEpisode: -1,
			currentSeason: 1,
			receiveNotification: true,
			__v: 0
		}
		const logEntry = {
			_id: mongoose.Types.ObjectId(),
            logType: 2000,
            logDate: new Date(),
			userId: userId,
			seriesTitle: seriesTitle
		}
		await Log.create(logEntry)
    	await UserSeries.create(userSeries)
	} else {
		console.log(`series with id ${seriesId} and user ${userId} already in database, skipped.`)
	}
	
	const response = {
		msg: "series connected with user"
	}
    return {
      statusCode: 201,
      body: JSON.stringify(response)
    }
  } catch (err) {
	console.log('Error while creating series: ', err)
	await reportError(err)
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
})
