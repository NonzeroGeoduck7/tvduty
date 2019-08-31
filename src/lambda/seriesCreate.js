// seriesCreate.js
import mongoose from 'mongoose'
import db from './server'
import Series from './seriesModel'

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  try {
    const data = JSON.parse(event.body),
          title = data.title,
          nrOfEpisodes = parseInt(data.nrOfEpisodes),
          id = mongoose.Types.ObjectId(),
          product = {
            _id: id,
            title: title,
            nrOfEpisodes: nrOfEpisodes,
            __v: 0
          },
          response = {
            msg: "SeriesObject successfully created",
            data: product
          }
    
    // Use Series.Model to create a new product
    await Series.create(product)
return {
      statusCode: 201,
      body: JSON.stringify(response)
    }
  } catch (err) {
    console.log('series.create', err) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
}
