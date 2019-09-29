import fetch from 'node-fetch'
import mongoose from 'mongoose'
import db from './server'
import Series from './seriesModel'
import Episodes from './episodesModel'

const API_ENDPOINT_UPDATE = 'http://api.tvmaze.com/updates/shows'
const API_ENDPOINT_EPISODES = 'http://api.tvmaze.com/shows/'

const dotenv = require('dotenv').config()
const SparkPost = require('sparkpost')
const euClient = new SparkPost(process.env.SPARKPOST_API_KEY)
	
async function getTvMazeData() {
	let data = await fetch(API_ENDPOINT_UPDATE, {
		method: 'GET',
		headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
		},
	})
	.catch(err => console.log('reading from ' + API_ENDPOINT + ' failed: ', err))
	return data.json()	
}

async function getInformationForSeries(seriesId) {
	let data = await fetch(API_ENDPOINT_EPISODES + seriesId + '?embed=episodes', {
		method: 'GET',
		headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
		},
	})
	.catch(err => console.log('reading from ' + API_ENDPOINT + ' failed: ', err))
	return data.json()	
}

function sendEmail() {

	euClient.transmissions.send({
		options: {
		  sandbox: true
		},
		content: {
		  subject: '[tvDuty] Status information',
		  from: 'tvduty@sparkpostbox.com',
		  html:'<html><body><p>This is a status mail. Daily deploy has just finished.</p></body></html>'
		},
		recipients: [
		  {address: 'andreasroth@hispeed.ch'}
		]
	  })
	  .then(data => {
		console.log('mail successfully sent!')
		console.log(data)
	  })
	  .catch(err => {
		console.log('error while sending mail')
		console.log(err)
	  })
}

function log(str) {
	console.log('['+ new Date() + '] ' + str)
}

exports.handler = async (event, context) => {
	context.callbackWaitsForEmptyEventLoop = false
	
	try {
		// mongoDB
		const seriesList = await Series.find()
		log('Found series: ' + seriesList.length)
		
		//tvmaze
		const response = await getTvMazeData()
		log('API accessed.')
		
		if (seriesList.length > 0 && typeof response !== 'undefined') {
			for (const series of seriesList){
				try {
					// measurement ms/s
					const seriesResponseDate = response[series.extId]*1000

					if(Date.parse(series.lastUpdated) < seriesResponseDate){
						// episodes need to be updated

						let extId = series.extId
						//log('[' + series.title + '] extId: '+ extId + '.')
						//let seriesId = extId.replace("/[^0-9]/gim","").trim()
						let seriesId = extId
						log('[' + series.title + '] Update necessary: ' + seriesId)
						
						try{
						    let r = await Episodes.deleteMany({seriesId:seriesId})
						    log('[' + series.title + '] deleteMany: ' + JSON.stringify(r))
						    log('[' + series.title + '] All episodes dropped.')
						} catch (error) {
							log('[' + series.title + '] del error: ' + JSON.stringify(error))
						}

						let info = await getInformationForSeries(seriesId)
						let newEps = info._embedded.episodes
						log('[' + series.title + '] New episodes fetched.')

						var eps = []
						newEps.forEach(function(ep){
							eps.push({
								"title":ep.name,
								"extId":ep.id,
								"seasonNr":ep.season,
								"episodeNr":ep.number,
								"seriesId":seriesId,
								"image":ep.image!=null?ep.image.original.replace("http://","https://"):null,
								"airstamp":ep.airstamp,
								"runtime":ep.runtime,
								"summary":ep.summary
							})
						})
						await Episodes.insertMany(eps)
						log('[' + series.title + '] New episodes inserted in DB.')

						// series object is changed and written back to db, check for changes here.
						series.lastUpdated = new Date()
						series.status = info.status
						series.poster = info.image!=null?info.image.original:null
						
						// TODO:
						// - measure difference in episode.length and series.nrOfEpisodes
						// - send notification here
						// - also check airdate
						
						let res = await Series.updateOne({"extId":series.extId}, series)
						log('[' + series.title + '] ' + res.nModified + ' series modified, should be 1')
						if (res.nModified != 1) {
							return { statusCode: 500, body: "series updateDate has not been updated" }
						}
					
					} else {
						log('[' + series.title + '] No update necessary.')
					}
				} catch(err){
					log('error while updating series with id: ' + series.extId + ' - ' + err)
				}
			}
		}
		
		log('end successfully. Send status email now.')
		sendEmail()
		
		return { statusCode: 200, body: 'deploy-succeeded function finished.' }
	} catch (err){
		log('end: ' + err)
		return { statusCode: 500, body: String(err) }
	}
};
