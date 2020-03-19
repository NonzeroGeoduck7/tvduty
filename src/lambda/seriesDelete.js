// seriesDelete.js
import mongoose from 'mongoose'
import db from './server'
import Log from './logModel'
import Series from './seriesModel'
import Episodes from './episodesModel'
import UserSeries from './userSeriesModel'
import UserEpisodes from './userEpisodesModel'
import Event from './eventModel'

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  try {
    const data = JSON.parse(event.body)
    const seriesId = parseInt(data.seriesId)
    const userId = data.userId
    
    let promiseCount = UserSeries.countDocuments({seriesId: seriesId})
    let promiseEpisodes = Episodes.find({seriesId: seriesId})
    let promiseSeriesTitle = Series.find({extId: seriesId})
    
    let arr = await Promise.all([promiseCount, promiseEpisodes, promiseSeriesTitle])
    let count = arr[0]
    let episodes = arr[1]
    let seriesTitle = arr[2][0].title

    if (typeof(seriesTitle) === "undefined"){
      // throw error
    }

    const episodesIdArray = episodes.map((entry)=>entry.extId)
    let p = []
    if (count === 1){
      // show is not connected to other users, delete completely
      p.push(Series.deleteMany({extId: seriesId}))
      p.push(Episodes.deleteMany({seriesId: seriesId}))
    }
    p.push(UserSeries.deleteMany({seriesId: seriesId, userId: userId}))
    p.push(Event.deleteMany({seriesId: seriesId, userId: userId}))
    p.push(UserEpisodes.deleteMany({
      episodeId: { $in: Array.from(episodesIdArray) }, 
      userId: userId
    } ))

    const logEntry = {
			_id: mongoose.Types.ObjectId(),
      logType: 2010,
      logDate: new Date(),
			userId: userId,
			seriesTitle: seriesTitle
		}
    p.push(Log.create(logEntry))

    await Promise.all(p)
    
    const response = {
      msg: "Series successfully deleted"
    }
    
    return {
      statusCode: 201,
      body: JSON.stringify(response)
    }
  } catch(err) {
    console.log('Error while deleting series: ', err)
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
}