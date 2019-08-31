// productDelete.js
import mongoose from 'mongoose'
// Load the server
import db from './server'
// Load the Product Model
import Series from './seriesModel'
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  try {
    // Parse the ID
    const id = JSON.parse(event.body),
          response = {
            msg: "Product successfully deleted"
          }
    
    // Use Product.Model to delete 
    await Series.findOneAndDelete({ _id: id })
    
    return {
      statusCode: 201,
      body: JSON.stringify(response)
    }
  } catch(err) {
    console.log('series.delete', err) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
}