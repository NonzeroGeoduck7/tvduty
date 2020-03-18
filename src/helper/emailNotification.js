
// send Email Notifications to users if there is informations about their series
import newsletterTemplate from './emailTemplates'

var _ = require('underscore')

var juice = require('juice')
const mustache = require('mustache')
const timestamp = require("performance-now")

const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
	host: 'smtp.zoho.eu',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.ZOHO_NEWSLETTER_USERNAME,
        pass: process.env.ZOHO_NEWSLETTER_PASSWORD
    }
})

export async function sendEmail(receiver, obj) {
	try {
		var time1 = timestamp()
		var html = juice(mustache.render(newsletterTemplate, obj))
		var time2 = timestamp()
		console.log('mustache rendering: '+(time2-time1)+'ms')
		
		var randomEntry = _.sample(obj.newEpisodes)
		if (obj.newEpisodes.length>1){
			var subjectString = 'New episodes from '+randomEntry.seriesTitle+' and other shows available'
		} else {
			var subjectString = 'New episode from '+randomEntry.seriesTitle+' available'
		}
		subjectString = subjectString+', '+new Date().toDateString()

		var mailOptions = {
			from: `"WhenAirsTheNextEpisode" <${process.env.ZOHO_NEWSLETTER_USERNAME}>`, // sender address (who sends)
			to: receiver,
			subject: subjectString,
			html: html
		}

		let info = await transporter.sendMail(mailOptions)

		console.log(`sending mail successful: ${info.messageId}`)

	} catch(err) {
		console.log(`Error while sending email: ${err}`)
		throw err
	}
}
