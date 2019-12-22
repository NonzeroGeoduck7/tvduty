// processEvent.js
import mongoose from 'mongoose'
import db from './server'
import Event from './eventModel'
import Episodes from './episodesModel'
import UserSeries from './userSeriesModel'

async function postAPI (source, data) {
  return fetch('/.netlify/functions/' + source, {
      method: 'post',
      body: JSON.stringify(data)
    })
    .then(res => {return res.json()})
    .catch(err => err)
}

async function markWatched(seriesId, userId, seasonNr, episodeNr) {
  await postAPI('episodesMarkWatched', {seriesId: seriesId, seasonNr: seasonNr, episodeNr: episodeNr, userId: userId})
    .then(response=>{console.log(response)})
    .catch(err => err)
}

async function processEventEpisodeWatched(eventUid) {
  const event = await Event.aggregate([
    { $match: { eventUid: eventUid } },
  ])

  if (event.length != 1){
    throw new Error('there is not exactly 1 event for eventUid '+eventUid)
  }
  
  const {seriesId, userId, seasonNr, episodeNr} = event[0]
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

function processEventNotificationSettings(eventUid){
  return {
    statusCode: 405,
    body: JSON.stringify({msg: "Method Not Allowed"})
  }
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  const data = JSON.parse(event.body),
        eventType = data.eventType,
        eventUid = data.eventUid

  if (typeof(eventUid) === "undefined"){
	  return {
        statusCode: 500,
        body: JSON.stringify({msg: "eventUid is undefined"})
      }
  }
  
  try{
    var result
    
    if (eventType == '1'){
      result = await processEventEpisodeWatched(eventUid)
    }
    if (eventType == '2'){
      result = await processEventNotificationSettings(eventUid)
    }

    return result
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
}
