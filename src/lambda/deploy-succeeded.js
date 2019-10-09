import mongoose from 'mongoose'
import db from '../lambda/server'
import { updateWithTvMaze } from '../helper/tvmaze'
import { sendEmail } from '../helper/emailNotification'

exports.handler = async (event, context) => {
	context.callbackWaitsForEmptyEventLoop = false
	
	try{
		var res = await updateWithTvMaze()

		//await sendEmail('andreasroth@hispeed.ch', 'text')

		return { statusCode: 200, body: 'deploy-succeeded function finished.' }
	} catch (err) {
		console.log('deploy-succeeded function end: ' + err)
		return { statusCode: 500, body: String(err) }
	}
}
