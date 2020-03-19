
// send Email Notifications to users if there is informations about their series
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


const newsletterTemplate = ``+
`
<html>
<head>
	<title>title</title>
	<style>
		tr:nth-child(even) {
			background-color: #42c2f5;
		}
		tr:nth-child(odd) {
			background-color: #f59e42;
		}
		.transparentBackgroundTable tr {
			background-color: transparent;
		}
		.button {
			color: #494949 !important;
			text-transform: uppercase;
			text-decoration: none;
			background: #ffffff;
			padding: 10px 20px 10px 20px;
			border: 4px solid #494949 !important;
			display: inline-block;
			transition: all 0.4s ease 0s;
		}
		.button:hover:nth-child(odd) {
			color: #f59e42 !important;
			background-color: #f6b93b;
			border-color: #f59e42 !important;
			transition: all 0.4s ease 0s;
		}
		.button:hover:nth-child(even) {
			color: #42c2f5 !important;
			background-color: #f6b93b;
			border-color: #42c2f5 !important;
			transition: all 0.4s ease 0s;
		}
	</style>
</head>
<body style="background-color: #EFF2F3">
<center>
	<center style="color: #000000; font-size: 11px; margin-bottom: 4px;">The following episodes are scheduled to air between {{timespan.start}} and {{timespan.end}}.</center>

		 <table width="780" border="0" cellspacing="0" cellpadding="0">
			<tr>
				<td style="padding-top: 40px; padding-left: 85px; padding-right: 85px; padding-bottom: 15px">
					<div style="text-align: left; width:49%; display: inline-block;">
						<a href="{{websiteUrl}}">
							<img src={{logoSrc}} alt="logo.png" style="width: 175px; height: 35px; text-align: right">
						</a>
					</div>
					<div style="text-align: right; width:50%; display: inline-block;">
						<strong style="font-weight: bold">{{numEpisodesToday}} episodes available today</strong>
						<br>
						<strong style="font-weight: bold"></strong>{{currentDate}}</strong>
					</div>
				</td>
			</tr>
			{{#newEpisodes}}
			<tr>
				<td>
					<table class="transparentBackgroundTable" width="780" border="0" cellspacing="0" cellpadding="0">
						<tr style="background-color: transparent;">
							<td style="font-size:18pt; padding-top: 40px; padding-left: 85px; padding-right: 85px; padding-bottom: 15px">
								<b>{{seriesTitle}}</b>
							</td>
						</tr>
						<tr style="background-color: transparent;">
							<td style="font-size:12pt; padding-top: 5px; padding-left: 85px; padding-right: 85px; padding-bottom: 5px">
								<table class="transparentBackgroundTable">
								{{#episodes}}
									<tr style="background-color: transparent;">
										<td colspan="2">
											{{seriesTitle}} {{seasonEpisodeNotation}}: {{episodeTitle}}
										</td>
									</tr><tr style="background-color: transparent;">
									</tr><tr style="background-color: transparent;">
										{{#episodeImage}}
										<td style="width: 300px; height:168px">
											<img src="{{.}}" alt="{{seriesTitle}}_{{seasonEpisodeNotation}}_image" style="width: 100%">
										</td>
										<td>
											<div style="height: 145px; overflow-y: auto">
												{{episodeSummary}}{{^episodeSummary}}No summary available{{/episodeSummary}}<br><br>Airtime: {{episodeAirDateTime}}.
											</div>
										</td>
										{{/episodeImage}}
										{{^episodeImage}}
										<td>
											<div style="height: 100px; overflow-y: auto">
												{{episodeSummary}}{{^episodeSummary}}No summary available{{/episodeSummary}}<br><br>Airtime: {{episodeAirDateTime}}.
											</div>
										</td>
										{{/episodeImage}}
									</tr>
									<tr style="background-color: transparent;">
										<td class="buttonCell" align="center" style="padding-top: 10px; padding-bottom: 10px">
											<a class="button" href="{{episodeWatchedUrl}}" target="_blank" rel="nofollow noopener" style="padding-bottom: 10px; text-transform: uppercase;text-decoration: none;background: #ffffff;padding: 20px;display: inline-block;transition: all 0.4s ease 0s;color: #494949 !important;border: 4px solid #494949 !important;">
												Mark as watched
											</a>
										</td>
									</tr>
								{{/episodes}}
								</table>
							</td>
						</tr>
						<tr style="background-color: transparent;">
							<td style="font-size:12pt; padding-left: 85px; padding-right: 85px; padding-bottom: 15px">
								<a href="{{turnOffNotificationsUrl}}">click here</a> to not receive any more notifications for {{seriesTitle}}
							</td>
						</tr><tr style="background-color: transparent;">
					</tr></table>
				</td><td>
			</td></tr>
			{{/newEpisodes}}
			<tr>
				<td>
					<br>
				</td>
			</tr>
		</table>
	
	<center style="color: #000000; font-size: 11px; margin-bottom: 4px;">
		This email was sent from a notification-only address, incoming email will not be monitored.
		<br>
		You can contact me under <a href="mailto:{{contactEmail}}">{{contactEmail}}</a>.</center>
	</center>

</body>
</html>
`
