// userSeriesRead.js
import mongoose from 'mongoose'
import db from './server'
import UserSeries from './userSeriesModel'

exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  try {
    const seriesId = event.queryStringParameters.seriesId,
          userId = event.queryStringParameters.userId
          
    // query
    var result = await UserSeries.find({seriesId: seriesId, userId: userId})

    const response = {
      msg: 'userSeries successfully found',
      data: result
    }

    return {
      statusCode: 201,
      body: JSON.stringify(response)
    }
  } catch (err) {
    console.log('error in userSeriesRead: ', err)
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
}
