// processEvent.js
import mongoose from 'mongoose'
import db from './server'
import Event from './eventModel'
import Episodes from './episodesModel'
import UserSeries from './userSeriesModel'
import { initSentry, catchErrors, reportError } from '../sentryWrapper'
initSentry()

async function processEventEpisodeWatched(userId, seriesId, seasonNr, episodeNr) {
  
  var query = await Episodes.aggregate([{
    $match: {
      $and: [{
        seriesId: seriesId,
      },{
        // constraints on season/episode
        $or: [{
          seasonNr: {
            $lt: seasonNr,
          },
        },
        {
          $and: [{
            seasonNr: seasonNr,
            episodeNr: {
              $lte: episodeNr,
            }
          }]
        }]
      }]
    }
  },
  {
    $count: "episodeCount"
  }
  ])

  if (query.length != 1){
    throw new Error('error while computing the number of watched episodes')
  }

  // mark as watched
  await UserSeries.findOneAndUpdate(
    { userId: userId, seriesId: seriesId },
    { $set: { "lastWatchedEpisode" : parseInt(query[0].episodeCount)-1, "currentSeason" : seasonNr } } // -1 because of index vs count
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
  
  try{
    
    const event = await Event.aggregate([
      { $match: { eventUid: eventUid } },
    ])
  
    if (event.length <= 0){
      return {
        statusCode: 200,
        body: JSON.stringify({msg: 'event not found'})
      }
    } else if (event.length > 1){
      reportError(new Error('eventUid '+eventUid+' describes multiple events'))
      return {
        statusCode: 200,
        body: JSON.stringify({msg: 'eventUid '+eventUid+' describes multiple events, error.'})
      }
    }

    if (event[0].dateEventProcessed){
      return {
        statusCode: 200,
        body: JSON.stringify({msg: 'The event with Uid '+eventUid+' has already been processed'})
      }
    }

    const eventType = event[0].eventType
    var result = {
      statusCode: 200,
      body: JSON.stringify({msg: 'unknown eventType '+eventType})
    }

    if (eventType == '1'){
      const { userId, seriesId, seasonNr, episodeNr } = event[0]

      result = await processEventEpisodeWatched(userId, seriesId, seasonNr, episodeNr)
      await markEventAsProcessed(eventUid)
    }
    if (eventType == '2'){
      const { userId, seriesId } = event[0]

      result = await processEventTurnOffNotification(userId, seriesId)
      await markEventAsProcessed(eventUid)
    }

    return result
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
})
