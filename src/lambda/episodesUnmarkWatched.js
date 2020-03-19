// episodesMarkWatched.js
import mongoose from 'mongoose'
import db from './server'
import Log from './logModel'
import UserSeries from './userSeriesModel'
import UserEpisodes from './userEpisodesModel'
import { initSentry, catchErrors, reportError } from '../sentryWrapper'
initSentry()

exports.handler = catchErrors(async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  try {
    const data = JSON.parse(event.body);

    const episodeId = parseInt(data.episodeId),
          episodeNotation = data.episodeNotation,
          seriesId = parseInt(data.seriesId),
          seriesTitle = data.seriesTitle,
          userId = data.userId;
    
    console.log("mark "+episodeId+" "+seriesTitle+" as unwatched.")

    let promiseDelRes = await UserEpisodes.deleteOne(
      { userId: userId, episodeId: episodeId }
    )

    const logEntry = {
			_id: mongoose.Types.ObjectId(),
      logType: 3010,
      logDate: new Date(),
			userId: userId,
      seriesTitle: seriesTitle,
      episodeNotation: episodeNotation
		}
    let promiseLog = Log.create(logEntry)
    
    let arr = await Promise.all([promiseDelRes, promiseLog])

    let delRes = arr[0]
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
    reportError(err)
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
})
