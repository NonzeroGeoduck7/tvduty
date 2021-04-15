// seriesRead.js
import mongoose from 'mongoose'
import db from './server'
import Series from './seriesModel'

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  try {
    // Use Series.Model to find all series matching the user
    const { userId, extId } = JSON.parse(event.body)

    let array = []
    if (userId){
      array = await Series.aggregate([
        {
          $lookup: {
            from: 'userseries',
            localField: 'extId',
            foreignField: 'seriesId',
            as: 'userseries'
          }
        },
        { $unwind: "$userseries" },
        { $match: { "userseries.userId": userId } },
        { $sort : { "userseries.lastAccessed": -1 } }
      ]);
    } else if (extId) {
      array = await Series.aggregate([
        { $match: { extId: parseInt(extId) } }, //parse to int necessary for some reason
      ])
    }
	  
    const response = {
      msg: 'Series successfully found',
      data: array
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(response)
    }
    
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
}
