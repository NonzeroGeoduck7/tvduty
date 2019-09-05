// seriesRead.js
import mongoose from 'mongoose'
import db from './server'
import Series from './seriesModel'

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  try {
    // Use Product.Model to find all products
    const series = await Series.find(),
          response = {
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