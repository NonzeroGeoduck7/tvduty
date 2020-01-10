import fetch from 'node-fetch'
import mongoose from 'mongoose'
import db from '../lambda/server'
import Series from '../lambda/seriesModel'
import Episodes from '../lambda/episodesModel'
import UserSeries from '../lambda/userSeriesModel'
import Event from '../lambda/eventModel'

import { sendEmail } from '../helper/emailNotification.js'
import { seasonEpisodeNotation, assureHttpsUrl } from '../helper/helperFunctions'
import { initSentry, catchErrors, reportError } from '../sentryWrapper'
initSentry()

const API_ENDPOINT_UPDATE = 'http://api.tvmaze.com/updates/shows'
const API_ENDPOINT_EPISODES = 'http://api.tvmaze.com/shows/'

const timestamp = require("performance-now")
const uid = require('uid-safe')

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
        if (typeof(result[email.email]) === 'undefined')
            result[email.email] = {'changeInfo':{}, "notiInfo":{}}
        if (typeof(result[email.email][description][seriesTitle]) === 'undefined'){
            result[email.email][description][seriesTitle]=[]
        }

        result[email.email].userId = email.userId
        result[email.email][description][seriesTitle].push(update)
    })

    return result
}

function change(name, from, to){
    return ' - '+ name + ': changed from ' + from + ' to ' + to + '.'
}

function diff(newEp, oldEp){
    if (typeof oldEp === 'undefined'){
        return 'new Episode: '+seasonEpisodeNotation(newEp.seasonNr,newEp.episodeNr)+': <b>'+newEp.title+'</b> '+(newEp.airstamp==null?'airdate unknown':'will air '+newEp.airstamp)+'.'
    }

    var changes = []
    /*
    if (newEp.title != oldEp.title){
        changes.push(change('title', oldEp.title, newEp.title))
    }
    */
    if (newEp.seasonNr !== oldEp.seasonNr){
        changes.push(change('seasonNr', oldEp.seasonNr, newEp.seasonNr))
    }
    if (newEp.episodeNr !== oldEp.episodeNr){
        changes.push(change('episodeNr', oldEp.episodeNr, newEp.episodeNr))
    }
    if (new Date(newEp.airstamp).toDateString() !== new Date(oldEp.airstamp).toDateString()){
        changes.push(change('airstamp', oldEp.airstamp, newEp.airstamp))
    }

    if (changes.length > 0){
        return seasonEpisodeNotation(newEp.seasonNr,newEp.episodeNr)+':<br>'+changes.join('<br>')
    } else {
        return ''
    }
}

function isEmpty(obj) { 
	for (var x in obj) { return false; }
	return true;
}

function generateEventEpisodeWatchedUrl(uniqueUid) {
	return process.env.URL+'/event/1/'+uniqueUid
}

function generateEventNotificationUrl(uniqueUid) {
    return process.env.URL+'/event/2/'+uniqueUid
}

function generateSeriesUrl(seriesId) {
    return process.env.URL+'/series/'+seriesId
}

exports.handler = catchErrors(async (event, context) => {
	context.callbackWaitsForEmptyEventLoop = false
    
    var today = new Date()
    today.setHours(22,0,0,0)
    
    var yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1) // last 24 hours

	try{

        var timeStartFunction = timestamp()
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
                    from: 'users',
                    localField: 'userseries.userId',
                    foreignField: 'userId',
                    as: 'users'
                }
            },
        ])

        var seriesWhereEpisodesAirToday = await Episodes.aggregate([
            { $match: {"airstamp": {
                    $gt: new Date(yesterday).toISOString(),
                    $lte: new Date(today).toISOString()
            } } },
            { $group: { _id: null, airToday: { $addToSet: "$seriesId"} } }
        ])

        var timeEndQuery = timestamp()
        
        //tvmaze
        const response = await getTvMazeData()
        log('API accessed.')
        
        var result = {}
        if (seriesList.length === 0 || typeof response === 'undefined') {
            return { statusCode: 200, body: 'database is empty or no results from tvmaze API. function finished' }
        }
        
        var seriesToInsert = []
        var seriesToDelete = []
        var epsToInsert = []
        var epsToDelete = []
        for (const series of seriesList){
            try {
                // change measurement to milliseconds for comparison
                const seriesResponseDate = response[series.extId]*1000

                if(Date.parse(series.lastUpdated) < seriesResponseDate ||
                    (seriesWhereEpisodesAirToday.length > 0 &&
                        seriesWhereEpisodesAirToday[0].airToday.includes(series.extId))){
                    // episodes need to be updated
                    let seriesId = series.extId

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
                    series.users.forEach(function(user) {
                        email.push(user.email)
                    })
                    
                    var description = 'changeInfo'
                    var seriesTitle = series.title

                    //eps.forEach(function(ep, idx){
                    //    result = addToMailBody(result, email, description, seriesTitle, diff(ep, oldEps[idx]))
                    //})
                    
                    // series object is changed and written back to db
                    const nrOfAiredEpisodes = eps.filter(e=>new Date(e.airstamp)<today).length
                    let obj = {
                        "title": series.title,
                        "extId": series.extId,
                        "lastUpdated": new Date(),
                        "status": info.status,
                        "nrOfAiredEpisodes": nrOfAiredEpisodes,
                        "poster": info.image!=null?assureHttpsUrl(info.image.original):null,
                    }
                    seriesToDelete.push(series.extId)
                    seriesToInsert.push(obj)

                    epsToInsert = epsToInsert.concat(eps)
                }
            } catch(err){
                log('error while updating series '+series.title+' with id: ' + series.extId + ' - ' + err)
                await reportError(err)
            }
        }

        // update episodes, critically if fails
        try{
            // update series at the end because of changes number of aired episodes
            await Series.deleteMany({extId: { $in: seriesToDelete }})
            await Series.insertMany(seriesToInsert)
            await Episodes.deleteMany({seriesId: { $in: epsToDelete }})
            await Episodes.insertMany(epsToInsert)

        } catch (err) {
            log(">>>>>")
            log("error while updating series or episodes: "+err)
            log("<<<<<")
            await reportError(err)
        }

        var timeEndUpdateSeries = timestamp()

        var seriesAirToday = new Set()
        try {
            // iterate over all episodes
            // if the episode aired yesterday, go over every user that is subscribed to this series
            // go over every userSeries and only send email if episode.seasonNr equals current Season of this user
            // also only send email if receiveNotification for this series is true
            
            var epsAiringToday = await Episodes.aggregate([
                { $match: {"airstamp": {
                        $gt: new Date(yesterday).toISOString(),
                        $lte: new Date(today).toISOString()
                } } },
                {
                    $lookup: {
                        from: 'series',
                        localField: 'seriesId',
                        foreignField: 'extId',
                        as: 'series'
                    }
                },
                {
                    $lookup: {
                        from: 'userseries',
                        localField: 'seriesId',
                        foreignField: 'seriesId',
                        as: 'userseries'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userseries.userId',
                        foreignField: 'userId',
                        as: 'users'
                    }
                },
            ])

            console.log("episodes airing today: "+epsAiringToday.length)

            // create notification if interested
            epsAiringToday.forEach(function(ep){
                var email = []
                ep.users.forEach(function(user) {
                    var isInterested = false
                    ep.userseries.forEach(function(us){
                        if (us.userId===user.userId && ep.series[0].extId===us.seriesId){
                            isInterested =  us.receiveNotification
                                            || ep.episodeNr == 1
                        }
                    })
                    if(isInterested){
                        email.push({
                            "email": user.email,
                            "userId": user.userId
                        })
                    }
                })
                var description = 'notiInfo'
                seriesAirToday.add(ep.series[0].extId)
                // NOTE:
                // if we use series information here, we need to ensure 
                // that the show is updated before this point
                // otherwise update happens at the end
                var update = {
                    "seriesTitle": ep.series[0].title,
                    "seriesId": ep.series[0].extId,
                    "seasonNr": ep.seasonNr,
                    "episodeNr": ep.episodeNr,
                    "seasonEpisodeNotation": seasonEpisodeNotation(ep.seasonNr,ep.episodeNr),
                    "episodeTitle": ep.title,
                    "episodeImage": ep.image,
                    "episodeSummary": ep.summary,
                    "episodeAirstamp": ep.airstamp
                }

                result = addToMailBody(result, email, description, ep.series[0].title, update)
            })
        } catch(err){
            console.log('error while going through episodes airing today: '+err)
            await reportError(err)
        }

        var timeEndCreateMailObject = timestamp()

        // use result and send mail
        var timeStartRewriteObject = timestamp()
        var eventsToStore = []
        for (email in result){
            
            result[email].timespan = {
                "start": yesterday.toUTCString(),
                "end": today.toUTCString()
            }
            const {userId, notiInfo, changeInfo} = result[email]

            result[email]["newEpisodes"] = []
            for (const seriesTitle in notiInfo){
                var eps = []
                notiInfo[seriesTitle].forEach(e => {

                    const episodeWatchedUid = uid.sync(18)
                    eventsToStore.push({
                        "eventUid": episodeWatchedUid,
                        "userId": userId,
                        "seriesId": e.seriesId,
                        "seasonNr":  e.seasonNr,
                        "episodeNr": e.episodeNr,
                        "dateEventCreated": new Date().toISOString()
                    })

                    e.episodeWatchedUrl = generateEventEpisodeWatchedUrl(episodeWatchedUid)
                    eps.push(e)
                })
                
                result[email]["newEpisodes"].push({
                    "seriesTitle": seriesTitle,
                    "showOnWebsiteUrl": generateSeriesUrl(eps[0].seriesId),
                    "turnOffNotificationsUrl": generateEventNotificationUrl(uid.sync(18)),
                    "episodes": eps
                })
                result[email]["notiInfo"]["seriesTitle"] = null
            }
            
            /*
            if (!isEmpty(changeInfo)){
                html += changeIntro
                for (const seriesTitle in changeInfo) {
                    html += '<b>'+seriesTitle+'</b>:<br>'
                    changeInfo[seriesTitle].forEach(e => {
                        html += ' - ' + e + '<br>'
                    })
                }
            }
            */
        }

        // delete old events and insert new ones
        const dateTwoMonthsInPast = new Date().setMonth(new Date().getMonth()-2)
        await Event.deleteMany({dateEventCreated: { $lte: new Date(dateTwoMonthsInPast).toISOString() } })
        var p1 = Event.insertMany(eventsToStore)

        var p2 = UserSeries.updateMany({ seriesId: { $in: Array.from(seriesAirToday) }}, { $set: { "lastAccessed" : new Date() } })

        var timeEndRewriteObject = timestamp()

        var promiseEmail = []
        for (email in result){
            result[email].currentDate = new Date().toDateString()
            result[email].performance = {
                "timeDBQuery": (timeEndQuery-timeStartFunction).toFixed(2),
                "timeUpdateSeries": (timeEndUpdateSeries-timeEndQuery).toFixed(2),
                "timeCreateObj": (timeEndCreateMailObject-timeEndUpdateSeries).toFixed(2),
                "timeRewriteObject": (timeEndRewriteObject - timeStartRewriteObject).toFixed(2)
            }
            try{
                var promise = sendEmail(email, result[email])
                promiseEmail.push(promise)
            } catch(err) {
                await reportError(err)
            }
        }
        await Promise.all([p1, p2].concat(promiseEmail))
        
		return { statusCode: 200, body: `tvmazeUpdate function successfully finished after roughly ${timeEndRewriteObject-timeStartFunction}ms.` }
	} catch (err) {
        console.log('tvmazeUpdate function finished with error: ' + err)
        await reportError(err)
		return { statusCode: 500, body: String(err) }
	}
});