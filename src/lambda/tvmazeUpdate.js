import fetch from 'node-fetch'
import mongoose from 'mongoose'
import db from '../lambda/server'
import * as Sentry from '@sentry/browser'
import Series from '../lambda/seriesModel'
import Episodes from '../lambda/episodesModel'

import { sendEmail } from '../helper/emailNotification.js'
import { assureHttpsUrl } from '../helper/helperFunctions'

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
	console.log(str)
}

function addToMailBody(result, email, description, seriesTitle, update){
    if (update == '')
        // do nothing
        return result
    
    email.forEach(function(email){
        if (typeof(result[email]) === 'undefined')
            result[email] = {'changeInfo':{}, "notiInfo":{}}
        if (typeof(result[email][description][seriesTitle]) === 'undefined'){
            result[email][description][seriesTitle]=[]
        }

        result[email][description][seriesTitle].push(update)
    })

    return result
}

function change(name, from, to){
    return ' - '+ name + ': changed from ' + from + ' to ' + to + '.'
}

function diff(newEp, oldEp){
    if (typeof oldEp === 'undefined'){
        return 'new Episode: s'+newEp.seasonNr+'e'+newEp.episodeNr+': <b>'+newEp.title+'</b> '+(newEp.airstamp==null?'airdate unknown':'will air '+newEp.airstamp)+'.'
    }

    var changes = []
    if (newEp.title != oldEp.title){
        changes.push(change('title', oldEp.title, newEp.title))
    }
    if (newEp.seasonNr != oldEp.seasonNr){
        changes.push(change('seasonNr', oldEp.seasonNr, newEp.seasonNr))
    }
    if (newEp.episodeNr != oldEp.episodeNr){
        changes.push(change('episodeNr', oldEp.episodeNr, newEp.episodeNr))
    }
    if (newEp.airstamp != oldEp.airstamp){
        changes.push(change('airstamp', oldEp.airstamp, newEp.airstamp))
    }

    if (changes.length > 0){
        return 's'+newEp.seasonNr+'e'+newEp.episodeNr+':<br>'+changes.join('<br>')
    } else {
        return ''
    }
}

exports.handler = async (event, context) => {
	context.callbackWaitsForEmptyEventLoop = false
    
    log("init function: "+new Date())

	try{
		// mongoDB
        const seriesList = await Series.aggregate([
            {
                $lookup: {
                    from: 'userseries',
                    localField: 'extId',
                    foreignField: 'seriesId',
                    as: 'userseries'
                }
            },
            {
                $lookup: {
                    from: 'user',
                    localField: 'userseries.userId',
                    foreignField: 'userId',
                    as: 'user'
                }
            },
        ])

        log('Found series: ' + seriesList.length)
        
        //tvmaze
        const response = await getTvMazeData()
        log('API accessed.')
        
        var result = {}
        if (seriesList.length > 0 && typeof response !== 'undefined') {
            
            var seriesToInsert = []
            var seriesToDelete = []
            var epsToInsert = []
            var epsToDelete = []
            for (const series of seriesList){
                try {
                    // needed for check if episodes air today
                    let seriesId = series.extId
                    var oldEps = await Episodes.aggregate([
                        { $match: { seriesId: parseInt(seriesId) } },
                        { $sort : { seasonNr : 1, episodeNr: 1 } },
                    ])

                    // measurement ms/s
                    const seriesResponseDate = response[series.extId]*1000
    
                    if(Date.parse(series.lastUpdated) < seriesResponseDate){
                        // episodes need to be updated

                        // find exact differences and save in some object
    
                        epsToDelete.push(seriesId)
    
                        let info = await getInformationForSeries(seriesId)
                        let newEps = info._embedded.episodes

                        var eps = []
                        newEps.forEach(function(ep){
                            eps.push({
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
                        })
                        
                        // CHANGES ON EPISODE LEVEL
                        var email = []
                        series.user.forEach(function(user) {
                            email.push(user.email)
                        })
                        var description = 'changeInfo'
                        var seriesTitle = series.title

                        eps.forEach(function(ep, idx){
                            result = addToMailBody(result, email, description, seriesTitle, diff(ep, oldEps[idx]))
                        })
    
                        // series object is changed and written back to db, check for changes in seriesObject here.
                        let obj = {
                            "title": series.title,
                            "extId": series.extId,
                            "lastUpdated": new Date(),
                            "status": info.status,
                            "nrOfEpisodes": eps.length,
                            "poster": info.image!=null?assureHttpsUrl(info.image.original):null,
                        }

                        // TODO:
                        // - measure difference in episode.length and series.nrOfEpisodes
                        // - send notification here
                        // - also check airdate
                        
                        seriesToDelete.push(series.extId)
                        seriesToInsert.push(obj)
    
                        // save new eps to find out if episodes air today
                        oldEps = eps

                        epsToInsert = epsToInsert.concat(eps)

                    } else {
                        log('[' + series.title + '] continue')
                    }

                    oldEps.forEach(function(ep){
                        var today = new Date()
                        today.setHours(22,0,0,0)
                        
                        var yesterday = new Date()
                        yesterday.setDate(yesterday.getDate() - 1)

                        if (new Date(ep.airstamp) > yesterday && new Date(ep.airstamp) < today){
                            var email = []
                            series.user.forEach(function(user) {
                                // look in series.userseries if receiveNotification == true
                                email.push(user.email)
                            })
                            var description = 'notiInfo'
                            var update = 's'+ep.seasonNr+'e'+ep.episodeNr+':'+ep.title + ' ('+ new Date(ep.airstamp).toDateString() + ' at '+new Date(ep.airstamp).toTimeString()+')<br>'
                            
                            result = addToMailBody(result, email, description, series.title, update)
                        }
                    })
                } catch(err){
                    Sentry.captureException(err)
                    log('error while updating series with id: ' + series.extId + ' - ' + err)
                }
            }

            // update episodes, critically if fails
            try{
                log("delete series")
                await Series.deleteMany({extId: { $in: seriesToDelete }})
                log("insert series")
                await Series.insertMany(seriesToInsert)
                log("delete episodes")
                await Episodes.deleteMany({seriesId: { $in: epsToDelete }})
                log("insert episodes")
                await Episodes.insertMany(epsToInsert)
                log("inserted")
            } catch (err) {
                log(">>>>>")
                log("error while updating series or episodes: "+err)
                log("<<<<<")
            }
        }

        // use result and send mail
        console.log(result)

        const sendEmailBoolean = event.queryStringParameters.sendEmail
        console.log("sendEmail: "+sendEmailBoolean)
        if (sendEmailBoolean && process.env.NODE_ENV === 'production'){
            for (email in result){
                await sendEmail(email, result[email])
            }
        }

		return { statusCode: 200, body: 'deploy-succeeded function finished.' }
	} catch (err) {
        Sentry.captureException(err)
		console.log('deploy-succeeded function end: ' + err)
		return { statusCode: 500, body: String(err) }
	} finally {
        log("end function: "+new Date())
    }
}