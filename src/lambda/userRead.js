// userRead.js
import mongoose, { Mongoose } from 'mongoose'
import db from './server'
import User from './userModel'

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  try {

    const data = JSON.parse(event.body)

    const result = await User.find({userId: data.userId})
    
    const response = {
      msg: 'User successfully found',
      data: result
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
