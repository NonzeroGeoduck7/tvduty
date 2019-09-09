// seriesUpdate.js
import mongoose from 'mongoose'
import db from './server'
import Series from './seriesModel'

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  try {
    // Parse the ID
    const data = JSON.parse(event.body),
          id = data.id,
          series = data.series,
          response = {
            msg: "Series successfully updated",
            data: series
          }
    
    // Use Series.Model and id to update 
    await Series.findOneAndUpdate({_id: id}, series)
    
    return {
      statusCode: 201,
      body: JSON.stringify(response)
    }
  } catch(err) {
    console.log('series.update', err)
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
}
