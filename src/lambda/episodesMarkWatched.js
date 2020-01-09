// episodesMarkWatched.js
import mongoose from 'mongoose'
import db from './server'
import Episodes from './episodesModel'
import UserSeries from './userSeriesModel'
import { seasonEpisodeNotation } from '../helper/helperFunctions'

exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  try {
    const data = JSON.parse(event.body);

    const seasonNr = parseInt(data.seasonNr),
          episodeNr = parseInt(data.episodeNr),
          seriesId = parseInt(data.seriesId),
          userId = data.userId;
    
    console.log("mark "+seriesId+" "+seasonEpisodeNotation(seasonNr, episodeNr)+" as watched.")

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
    },{
      $count: "episodeCount"
    }])

    // mark as watched
    await UserSeries.findOneAndUpdate(
      { userId: userId, seriesId: seriesId },
      { $set: {
        "lastWatchedEpisode" : parseInt(query[0].episodeCount)-1,
        "currentSeason" : seasonNr }, // -1 because of index vs count
        "lastAccessed" : new Date() }
    )
	
    return {
      statusCode: 201,
      body: JSON.stringify(query)
    }
  } catch (err) {
    console.log('error in episodesMarkWatched: ', err)
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
}
