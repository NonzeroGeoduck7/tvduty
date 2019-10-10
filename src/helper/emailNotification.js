
// send Email Notifications to users if there is informations about their series

const dotenv = require('dotenv').config()

const send = require('gmail-send')({
	user: process.env.GMAIL_USERNAME,
	pass: process.env.GMAIL_PASSWORD,
	subject: '[tvDuty] status',
	//text:    'deploy finished',            // Plain text
	//html:    '<b>html text</b>'            // HTML
	// files: [ filepath ],                  // Set filenames to attach (if you need to set attachment filename in email, see example below
})

export async function sendEmail(receiver, html) {
	try {
		const {result,full} = await send({
			to: receiver,
			html: '<p>'+html+'</p>',
		})
		console.log('sending mail successful: ' + result)
	} catch(error) {
		console.log('Error while sending email: ' + error)
	}
}