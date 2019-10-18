
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

function isEmpty(obj) { 
	for (var x in obj) { return false; }
	return true;
 }

export async function sendEmail(receiver, src) {
	try {
		let html = '<html>'
		const notiIntro = 'The following episodes aired last night:<br><br>'
		const changeIntro = '<br><br>Changes:<br><br>'

		const {notiInfo, changeInfo} = src

		if (!isEmpty(notiInfo)){
			html += notiIntro
			for (const seriesTitle in notiInfo) {
				html += '<b>'+seriesTitle+'</b>:<br>'
				notiInfo[seriesTitle].forEach(e => {
					html += ' - ' + e + '<br>'
				})
				html += '<br>'
			}
		}
		if (!isEmpty(changeInfo)){
			html += changeIntro
			for (const seriesTitle in changeInfo) {
				html += '<b>'+seriesTitle+'</b>:'
				for (const info in changeInfo[seriesTitle]){
					html += ' - ' + info + '<br>'
				}
			}
		}

		html += '</html>'

		console.log(html)

		const {result,full} = await send({
			to: receiver,
			html: html,
		})
		console.log('sending mail successful: ' + result)
	} catch(error) {
		console.log('Error while sending email: ' + error)
	}
}