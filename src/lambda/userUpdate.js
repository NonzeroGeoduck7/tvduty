// userUpdate.js
import mongoose, { Mongoose } from 'mongoose'
import db from './server'
import User from './userModel'

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  function validateEmail(mail) 
  {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)){
        return true
    } else {
        return false
    }
  }


  try {
    const data = JSON.parse(event.body)

    if (validateEmail(data.email)){
        await User.findOneAndUpdate({userId: data.userId}, { $set: { "email" : data.email } })
    } else {
        throw new Error("email address has wrong format")
    }

    const response = {
      msg: 'User successfully updated'
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
