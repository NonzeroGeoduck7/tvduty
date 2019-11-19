// processEvent.js
import mongoose from 'mongoose'
import db from './server'
import Event from './eventModel'

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  const data = JSON.parse(event.body),
        eventUid = data.eventUid

  console.log(eventUid)

  if (typeof(eventUid) === "undefined"){
	  return {
        statusCode: 500,
        body: JSON.stringify({msg: "eventUid is undefined"})
      }
  }
  
  try {
    //
    const event = await Event.aggregate([
      { $match: { eventUid: eventUid } },
    ])

    console.log("found: " + event.length + " events.")
    
    var result = ""
    if (event.length > 0){
      result = "ok"
    } else {
      result = "No event found. This functionality is not ready to be used."
    }

    const response = {
      msg: result,
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
