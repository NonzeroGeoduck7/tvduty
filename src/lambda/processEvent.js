// processEvent.js
import mongoose from 'mongoose'
import db from './server'
import Event from './eventModel'
import UserEpisodes from './userEpisodesModel'
import UserSeries from './userSeriesModel'
import { initSentry, catchErrors, reportError } from '../sentryWrapper'
initSentry()

async function processEventEpisodeWatched(userId, seriesId, episodeId) {
  
  await UserEpisodes.updateOne(
    { userId: userId, episodeId: episodeId },
    { $set: { timeWatched: new Date() } },
    { upsert: true, }
  )

  let numAdded = 1

  // mark as watched
  await UserSeries.findOneAndUpdate(
    { userId: userId, seriesId: seriesId },
      { 
        $set: { "lastAccessed" : new Date() } ,
        $inc: { "numWatchedEpisodes" : numAdded, }
      }
  )

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
    const { userId, seriesId, episodeId } = eventDB[0]

    result = await processEventEpisodeWatched(userId, seriesId, episodeId)
    await markEventAsProcessed(eventUid)
  }
  if (eventType == '2'){
    const { userId, seriesId } = eventDB[0]

    result = await processEventTurnOffNotification(userId, seriesId)
    await markEventAsProcessed(eventUid)
  }

  return result
})
