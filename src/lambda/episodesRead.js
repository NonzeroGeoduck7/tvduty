// episodesRead.js
import mongoose from 'mongoose'
import db from './server'
import Episodes from './episodesModel'

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  const seriesId = event.queryStringParameters.seriesId
  if (typeof(seriesId) === "undefined"){
	  return {
        statusCode: 500,
        body: JSON.stringify({msg: "seriesId is undefined"})
      }
  }
  
  try {
    // Use Episodes.Model to find all series matching the user
    const episodes = await Episodes.aggregate([
	    {
	  	  $lookup: {
	  	    from: 'series',
	  	    localField: 'seriesId',
	  	    foreignField: 'extId',
	  	    as: 'series'
	      }
	    },
		{ $match: { seriesId: parseInt(seriesId) } },
	  ]);
	  
    const response = {
      msg: 'Episodes successfully found',
      data: episodes
    }
    
	console.log('Episodes successfully read from DB.')
	
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
