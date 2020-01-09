// episodesRead.js
import mongoose from 'mongoose'
import db from './server'
import Episodes from './episodesModel'

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  const { userId } = JSON.parse(event.body)

  if (typeof(userId) === "undefined"){
	  return {
        statusCode: 500,
        body: JSON.stringify({msg: "userId is undefined"})
      }
  }
  
  try {
    const date_from = new Date()
    date_from.setMonth(date_from.getMonth() - 1)
    const date_to = new Date()
    date_to.setDate(date_to.getDate()+7)
    const episodes = await Episodes.aggregate([
      {
        $match: {
          "airstamp": {
            $gt: new Date(date_from).toISOString(),
            $lte: new Date(date_to).toISOString()
          }
        }
      },
      { $sort : { airstamp : -1 } },
      {
        $lookup: {
            from: 'userseries',
            localField: 'seriesId',
            foreignField: 'seriesId',
            as: 'userseries'
        }
      },
      {
        $match: {
          "userseries.userId": userId
        }
      },
      {
        $lookup: {
            from: 'series',
            localField: 'seriesId',
            foreignField: 'extId',
            as: 'series'
        }
      },
      {
        "$unwind": "$series"
      },
      {
        $project: {
          "_id": 1,
          "title": 1,
          "airstamp": 1,
          "series": "$series.title",
        }
      }
    ])

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
