import fetch from 'node-fetch';
import mongoose from 'mongoose'
import db from './server'
import Series from './seriesModel'
import Episodes from './episodesModel'

const API_ENDPOINT_UPDATE = 'http://api.tvmaze.com/updates/shows';
const API_ENDPOINT_EPISODES = 'http://api.tvmaze.com/shows/';


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

async function getEpisodesForSeries(seriesId) {
	let data = await fetch(API_ENDPOINT_EPISODES + seriesId + '/episodes', {
		  method: 'GET',
		  headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		  },
	})
	.catch(err => console.log('reading from ' + API_ENDPOINT + ' failed: ', err))
	return data.json()	
}

function log(str) {
	console.log('['+ new Date() + '] ' + str)
}

exports.handler = async (event, context) => {
	try {
		
		// mongoDB
		const seriesList = await Series.find()
		log('Found series: ' + seriesList.length)
		
		//tvmaze
		const response = await getTvMazeData()
		log('API accessed.')
		
		if (seriesList.length > 0 && typeof response !== 'undefined') {
			seriesList.forEach(async function(series) {
				
				try {
					// measurement ms/s
					const seriesResponseDate = response[series.extId]*1000

					if(Date.parse(series.lastUpdated) < seriesResponseDate){
						// episodes need to be updated
						log('[' + series.title + '] Update necessary.')

						let extId = series.extId
						//log('[' + series.title + '] extId: '+ extId + '.')
						//let seriesId = extId.replace("/[^0-9]/gim","").trim()
						let seriesId = extId
						await Episodes.deleteMany({"seriesId":seriesId})
						log('[' + series.title + '] All episodes dropped.')

						let newEps = await getEpisodesForSeries(seriesId)
						log('[' + series.title + '] New episodes fetched.')

						var eps = []
						newEps.forEach(function(ep){
							eps.push({
								"title":ep.name,
								"extId":ep.id,
								"seasonNr":ep.season,
								"episodeNr":ep.number,
								"seriesId":seriesId,
								"image":ep.image!=null?ep.image.original:null,
								"airstamp":ep.airstamp,
								"runtime":ep.runtime,
								"summary":ep.summary
							})
						})
						await Episodes.insertMany(eps)
						log('[' + series.title + '] New episodes inserted in DB.')

						series.lastUpdated = new Date()
						
						// TODO:
						// - measure difference in episode.length and series.nrOfEpisodes
						// - send notification here
						// - also check airdate
						
						let res = await Series.updateOne({"extId":series.extId}, series)
						log('[' + series.title + '] ' + res.nModified + ' series modified.')
						if (res.nModified != 1) {
							throw "series updateDate has not been updated"
						}
					
					} else {
						log('[' + series.title + '] No update necessary.')
					}
				} catch(err){
					log(err)
				}
			})
		}
		
		return { statusCode: 200, body: 'deploy-succeeded function finished.' }
	} catch (err){
		console.log(err)
		return { statusCode: 500, body: String(err) }
	}
};
