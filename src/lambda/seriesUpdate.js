// productUpdate.js
import mongoose from 'mongoose'
// Load the server
import db from './server'
// Load the Product Model
import Series from './seriesModel'
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  try {
    // Parse the ID
    const data = JSON.parse(JSON.parse(event.body)),
          id = data.id,
          series = data.series,
          response = {
            msg: "Product successfully updated",
            data: series
          }
    
    // Use Product.Model and id to update 
    await Series.findOneAndUpdate({_id: id}, series)
    
    return {
      statusCode: 201,
      body: JSON.stringify(response)
    }
  } catch(err) {
    console.log('series.update', err) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
}