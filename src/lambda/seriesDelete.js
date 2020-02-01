// seriesDelete.js
import mongoose from 'mongoose'
import db from './server'
import Series from './seriesModel'
import Episodes from './episodesModel'
import UserSeries from './userSeriesModel'
import Event from './eventModel'

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  try {
    const data = JSON.parse(event.body)
    const seriesId = parseInt(data.seriesId)
    const userId = data.userId
    
    const count = await UserSeries.countDocuments({seriesId: seriesId})

    if (count === 1){
      // show is not connected to other users, delete completely
      await Series.deleteMany({extId: seriesId})
      await Episodes.deleteMany({seriesId: seriesId})
    }
    await UserSeries.deleteMany({seriesId: seriesId, userId: userId})
    await Event.deleteMany({seriesId: seriesId, userId: userId})

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