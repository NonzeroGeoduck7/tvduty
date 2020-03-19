// processEvent.js
import mongoose from 'mongoose'
import db from './server'
import Log from './logModel'
import Event from './eventModel'
import UserEpisodes from './userEpisodesModel'
import UserSeries from './userSeriesModel'
import { initSentry, catchErrors, reportError } from '../sentryWrapper'
initSentry()

async function processEventEpisodeWatched(userId, seriesId, seriesTitle, episodeId, episodeNotation) {
  
  const logEntry = {
    _id: mongoose.Types.ObjectId(),
    logType: 3002,
    logDate: new Date(),
    userId: userId,
    seriesTitle: seriesTitle,
    episodeNotation: episodeNotation
  }
  let promiseLog = Log.create(logEntry)

  await UserEpisodes.updateOne(
    { userId: userId, episodeId: episodeId },
    { $set: { timeWatched: new Date() } },
    { upsert: true, }
  )

  let numAdded = 1

  // mark as watched
  let promiseUserSeries = UserSeries.findOneAndUpdate(
    { userId: userId, seriesId: seriesId },
      { 
        $set: { "lastAccessed" : new Date() } ,
        $inc: { "numWatchedEpisodes" : numAdded, }
      }
  )

  await Promise.all([promiseLog, promiseUserSeries])

  const response = {
    msg: "event successfully processed",
  }

  return {
    statusCode: 200,
    body: JSON.stringify(response)
  }
}

async function processEventTurnOffNotification(userId, seriesId){
  await UserSeries.findOneAndUpdate(
    { userId: userId, seriesId: seriesId },
    { $set: { "receiveNotification" : false } }
  )
  
  return {
    statusCode: 200,
    body: JSON.stringify({msg: "successfully disabled notifications for this show"})
  }
}

async function markEventAsProcessed(eventUid){
  await Event.findOneAndUpdate(
    {eventUid: eventUid},
    { $set: { "dateEventProcessed" : new Date().toISOString() } }
  )
}

exports.handler = catchErrors(async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  const data = JSON.parse(event.body),
        eventUid = data.eventUid

  if (typeof(eventUid) === "undefined"){
	  return {
        statusCode: 500,
        body: JSON.stringify({msg: "eventUid is undefined"})
      }
  }
  
  const eventDB = await Event.aggregate([
    { $match: { eventUid: eventUid } },
  ])

  if (eventDB.length <= 0){
    return {
      statusCode: 200,
      body: JSON.stringify({msg: 'event not found'})
    }
  } else if (eventDB.length > 1){
    reportError(new Error('eventUid '+eventUid+' describes multiple events'))
    return {
      statusCode: 200,
      body: JSON.stringify({msg: 'eventUid '+eventUid+' describes multiple events, error.'})
    }
  }

  if (eventDB[0].dateEventProcessed){
    return {
      statusCode: 200,
      body: JSON.stringify({msg: 'The event with Uid '+eventUid+' has already been processed'})
    }
  }

  const eventType = eventDB[0].eventType
  var result = {
    statusCode: 200,
    body: JSON.stringify({msg: 'unknown eventType '+eventType})
  }

  if (eventType == '1'){
    const { userId, seriesId, seriesTitle, episodeId, episodeNotation } = eventDB[0]

    result = await processEventEpisodeWatched(userId, seriesId, seriesTitle, episodeId, episodeNotation)
    await markEventAsProcessed(eventUid)
  }
  if (eventType == '2'){
    const { userId, seriesId } = eventDB[0]

    result = await processEventTurnOffNotification(userId, seriesId)
    await markEventAsProcessed(eventUid)
  }

  return result
})
