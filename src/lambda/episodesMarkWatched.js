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

    const episodesArray = JSON.parse(data.episodesArray),
          episodeNotation = data.episodeNotation,
          seriesId = parseInt(data.seriesId),
          seriesTitle = data.seriesTitle,
          userId = data.userId;
    
    console.log("mark "+seriesId+" episodes "+JSON.stringify(episodesArray)+" as watched.")

    var numAdded = 0

    let upsertRes = await UserEpisodes.bulkWrite( 
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

    let logType = 3000
    if (numAdded > 1){ // log bulk write or single write
      logType = 3001
    }

    
    const logEntry = {
			_id: mongoose.Types.ObjectId(),
      logType: logType,
      logDate: new Date(),
			userId: userId,
      seriesTitle: seriesTitle,
      episodeNotation: episodeNotation
		}
    let promiseLog = Log.create(logEntry)
    
    // mark as watched
    let promiseUserSeries = UserSeries.findOneAndUpdate(
      { userId: userId, seriesId: seriesId },
        { 
          $set: { "lastAccessed" : new Date() } ,
          $inc: { "numWatchedEpisodes" : numAdded, }
        }
    )

    await Promise.all([promiseUserSeries, promiseLog])

    return {
      statusCode: 201,
      body: JSON.stringify(upsertRes)
    }
  } catch (err) {
    console.log('error in episodesMarkWatched: ', err)
    reportError(err)
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
})
