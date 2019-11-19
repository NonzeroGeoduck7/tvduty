// seriesCreate.js
import mongoose from 'mongoose'
import db from './server'
import Series from './seriesModel'
import UserSeries from './userSeriesModel'

import fetch from 'isomorphic-fetch';

exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  async function showLookup(seriesId) {
	  const API_ENDPOINT = "https://api.tvmaze.com/shows/"
	  
	  if (typeof(seriesId) == "undefined"){
		  console.log("undefined")
		  return
	  } else {
		  console.log('lookup series with id: ' + seriesId)
	  }
	  const myJson = await fetch(API_ENDPOINT+seriesId)
	    .then(function(response) {
	      return response.json();
	    });
	  
	  console.log("show information fetch successful.")
	  return myJson
  }
  
  try {
    const data = JSON.parse(event.body);
    const res = await showLookup(data.id);
    const {name: title, id: extId, image, status, schedule} = res,
          id = mongoose.Types.ObjectId(),
		  lastUpdated = new Date('1970-12-12'),
		  posterLink = image!=null?image.original.replace("http://","https://"):null,
//		  schedule = schedule!=null?schedule.days:null,
		  userId = data.userId,
          series = {
            _id: id,
            title: title,
			extId: extId,
			status: status,
			poster: posterLink,
			lastUpdated: lastUpdated,
            __v: 0
          },
		  userSeries = {
			  _id: mongoose.Types.ObjectId(),
			  userId: userId,
			  seriesId: extId,
			  lastWatchedEpisode: -1,
			  currentSeason: 1,
			  receiveNotification: true,
			  __v: 0
		  },
          response = {
            msg: "SeriesObject successfully created",
            data: series
          }
    
    // Use Series.Model to create a new product
	var seriesInDb = await Series.countDocuments({title: series.title})
	if (seriesInDb < 1) {
    	await Series.create(series)
	} else {
		console.log('series with id ' + extId + ' already in database, skipped.')
	}
    
	var userSeriesInDb = await UserSeries.countDocuments({userId: userId, seriesId: extId})
	if (userSeriesInDb < 1) {
    	await UserSeries.create(userSeries)
	} else {
		console.log('series with id ' + extId + ' and user ' + userId + 'already in database, skipped.')
	}
	
    return {
      statusCode: 201,
      body: JSON.stringify(response)
    }
  } catch (err) {
    console.log('series.create', err)
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
}
