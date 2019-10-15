import fetch from 'node-fetch'
import mongoose from 'mongoose'
import db from '../lambda/server'
import Series from '../lambda/seriesModel'
import Episodes from '../lambda/episodesModel'

import { sendEmail } from '../helper/emailNotification.js'

const API_ENDPOINT_UPDATE = 'http://api.tvmaze.com/updates/shows'
const API_ENDPOINT_EPISODES = 'http://api.tvmaze.com/shows/'

async function getTvMazeData() {
	let data = await fetch(API_ENDPOINT_UPDATE, {
		method: 'GET',
		headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
		},
	})
	.catch(err => console.log('reading from ' + API_ENDPOINT_UPDATE + ' failed: ', err))
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
	.catch(err => console.log('reading from ' + API_ENDPOINT_EPISODES + ' failed: ', err))
	return data.json()	
}

function log(str) {
	console.log('['+ new Date() + '] ' + str)
}

function addToMailBody(result, email, description, seriesTitle, update){
    if (update == '')
        // do nothing
        return result

    if (typeof(result[email]) === 'undefined')
        result[email] = {'changeInfo':{}, "notiInfo":{}}
    if (typeof(result[email][description][seriesTitle]) === 'undefined'){
        result['andreasroth@hispeed.ch'][description][seriesTitle]=[]
    }

    result[email][description][seriesTitle].push(update)
    return result
}

function diff(newEp, oldEp){
    if (typeof oldEp === 'undefined'){
        return 'new Episode: '+JSON.stringify(newEp)
    }

    var changes = []
    if (newEp.title != oldEp.title){
        changes.push('title: <span style="background-color: #FF0000">'+oldEp.title+'</span><br><span style="background-color: #00FF00">'+newEp.title+'</span>')
    }
    if (newEp.seasonNr != oldEp.seasonNr){
        changes.push('seasonNr: <span style="background-color: #FF0000">'+oldEp.seasonNr+'</span><br><span style="background-color: #00FF00">'+newEp.seasonNr+'</span>')
    }
    if (newEp.episodeNr != oldEp.episodeNr){
        changes.push('episodeNr: <span style="background-color: #FF0000">'+oldEp.episodeNr+'</span><br><span style="background-color: #00FF00">'+newEp.episodeNr+'</span>')
    }
    if (newEp.airstamp != oldEp.airstamp){
        changes.push('airstamp: <span style="background-color: #FF0000">'+oldEp.airstamp+'</span><br><span style="background-color: #00FF00">'+newEp.airstamp+'</span>')
    }

    if (changes.length > 0){
        return 's'+newEp.seasonNr+'e'+newEp.episodeNr+':<br>'+changes.join('<br>')
    } else {
        return ''
    }
}

exports.handler = async (event, context) => {
	context.callbackWaitsForEmptyEventLoop = false
	
	try{
		// mongoDB
        const seriesList = await Series.find()
        log('Found series: ' + seriesList.length)
        
        //tvmaze
        const response = await getTvMazeData()
        log('API accessed.')
        
        var result = {}
        if (seriesList.length > 0 && typeof response !== 'undefined') {
            
            for (const series of seriesList){
                try {
                    // measurement ms/s
                    const seriesResponseDate = response[series.extId]*1000
    
                    if(Date.parse(series.lastUpdated) < seriesResponseDate){

                        // episodes need to be updated
                        let seriesId = series.extId
                        log('[' + series.title + '] Update necessary: ' + seriesId)

                        // find exact differences and save in some object

                        var oldEps = await Episodes.aggregate([
                            { $match: { seriesId: parseInt(seriesId) } },
                            { $sort : { seasonNr : 1, episodeNr: 1 } },
                        ])
    
                        await Episodes.deleteMany({seriesId:seriesId})
                        log('[' + series.title + '] All episodes dropped.')
    
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
                        
                        // CHANGES ON EPISODE LEVEL
                        var email = 'andreasroth@hispeed.ch'
                        var description = 'changeInfo' // or NotiInfo
                        var seriesTitle = series.title

                        eps.forEach(function(ep, idx){
                            result = addToMailBody(result, email, description, seriesTitle, diff(ep, oldEps[idx]))
                        })
    
                        // series object is changed and written back to db, check for changes in seriesObject here.
                        series.lastUpdated = new Date()
                        series.status = info.status
                        series.nrOfEpisodes = eps.length
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
    
                        // find out which users subscribed to this series
                        // -> select u.email from userSeries join user u on userId=userId where seriesId=seriesId  
                        // ---> add changes to all emails
    
                        // --> if episodes are already fetched, check if episode airs today
    
                    } else {
                        log('[' + series.title + '] No update necessary.')
                    }
                } catch(err){
                    log('error while updating series with id: ' + series.extId + ' - ' + err)
                }
            }
        }

        // use result and send mail
        console.log(result)

        const sendEmailBoolean = event.queryStringParameters.sendEmail
        console.log("sendEmail: "+sendEmail)
        if (sendEmailBoolean){
            for (const email in result) {
                await sendEmail(email, JSON.stringify(result[email]))
            }
        }

		return { statusCode: 200, body: 'deploy-succeeded function finished.' }
	} catch (err) {
		console.log('deploy-succeeded function end: ' + err)
		return { statusCode: 500, body: String(err) }
	}
}