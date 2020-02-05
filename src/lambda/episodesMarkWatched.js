// episodesMarkWatched.js
import mongoose from 'mongoose'
import db from './server'
import UserSeries from './userSeriesModel'
import UserEpisodes from './userEpisodesModel'

exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  try {
    const data = JSON.parse(event.body);

    const episodesArray = JSON.parse(data.episodesArray),
          seriesId = parseInt(data.seriesId),
          userId = data.userId;
    
    console.log("mark "+seriesId+" episodes "+JSON.stringify(episodesArray)+" as watched.")

    /*
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
      }},
      { $sort : { seasonNr : 1, episodeNr: 1 } },
      {
        $project: {
          "_id": 0,
          "extId":1,
        }
      },
    ])
    */

    var numAdded = 0

    var upsertRes = await UserEpisodes.bulkWrite( 
      episodesArray.map((entry)=>
        ({
          updateOne: {
            filter: { userId: userId, episodeId: entry },
            update: { $set: { timeWatched: new Date() } },
            upsert: true,
          }
        })
      )
    )

    numAdded = upsertRes.nUpserted

    // mark as watched
    await UserSeries.findOneAndUpdate(
      { userId: userId, seriesId: seriesId },
        { 
          $set: { "lastAccessed" : new Date() } ,
          $inc: { "numWatchedEpisodes" : numAdded, }
        }
    )

    return {
      statusCode: 201,
      body: JSON.stringify(upsertRes)
    }
  } catch (err) {
    console.log('error in episodesMarkWatched: ', err)
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
}
