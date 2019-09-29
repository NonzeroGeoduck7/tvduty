// episodesMarkWatched.js
import mongoose from 'mongoose'
import db from './server'
import Episodes from './episodesModel'
import UserSeries from './userSeriesModel'

exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  try {
    const data = JSON.parse(event.body);

    const seasonNr = parseInt(data.seasonNr),
          episodeNr = parseInt(data.episodeNr),
          seriesId = parseInt(data.seriesId),
          userId = data.userId;
    
    // find out what index the episode in overall episode list has. start counting with 0.
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
                  $lt: episodeNr,
                }
              }]
            }]
          }]
        }
      },
      {
        $count: "episodeIndex"
      }
    ])

    // mark as watched
    await UserSeries.findOneAndUpdate(
      { userId: userId, seriesId: seriesId },
      { $set: { "currentEpisode" : parseInt(query[0].episodeIndex) } }
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