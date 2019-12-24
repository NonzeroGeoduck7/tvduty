// seriesRead.js
import mongoose from 'mongoose'
import db from './server'
import Series from './seriesModel'

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  try {
    // Use Series.Model to find all series matching the user
    const series = await Series.aggregate([
	    {
	  	  $lookup: {
	  	    from: 'userseries',
	  	    localField: 'extId',
	  	    foreignField: 'seriesId',
	  	    as: 'userseries'
	      }
      },
      { $sort : { lastAccessed: -1 } }
	  ]);
	  
    const response = {
      msg: 'Series successfully found',
      data: series
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
