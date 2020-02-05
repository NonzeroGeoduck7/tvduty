// episodesMarkWatched.js
import mongoose from 'mongoose'
import db from './server'
import UserSeries from './userSeriesModel'
import UserEpisodes from './userEpisodesModel'

exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  try {
    const data = JSON.parse(event.body);

    const episodeId = parseInt(data.episodeId),
          seriesId = parseInt(data.seriesId),
          userId = data.userId;
    
    console.log("mark "+episodeId+" as unwatched.")

    var delRes = await UserEpisodes.deleteOne(
      { userId: userId, episodeId: episodeId }
    )

    // update num of watched episodes
    await UserSeries.findOneAndUpdate(
      { userId: userId, seriesId: seriesId },
        { 
          $set: { "lastAccessed" : new Date() } ,
          $inc: { "numWatchedEpisodes" : -delRes.n, }
        }
    )
	
    return {
      statusCode: 200,
      body: JSON.stringify(delRes)
    }
  } catch (err) {
    console.log('error in episodesUnmarkWatched: ', err)
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
}
