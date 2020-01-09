import { url } from 'inspector'
import { reportError } from '../sentryWrapper'

// send Email Notifications to users if there is informations about their series

const mustache = require('mustache')
const timestamp = require("performance-now")

const send = require('gmail-send')({
	user: process.env.GMAIL_USERNAME,
	pass: process.env.GMAIL_PASSWORD,
	subject: '[tvDuty] ['+new Date().toDateString()+'] status',
})

export async function sendEmail(receiver, obj) {
	try {
		var time1 = timestamp()
		var html = mustache.render(template, obj)
		var time2 = timestamp()
		console.log('mustache rendering: '+(time2-time1)+'ms')
		
		var randomEntry = _.sample(obj.newEpisodes)
		if (obj.newEpisodes.length>1){
			var subjectString = 'New episodes from '+randomEntry.seriesTitle+' and other shows available'
		} else {
			var subjectString = 'New episode from '+randomEntry.seriesTitle+' available'
		}
		subjectString = subjectString+', '+new Date().toDateString()
		
		const {result,full} = await send({
			from: '"tvDuty"',
			subject: subjectString,
			to: receiver,
			html: html,
		})
		
		console.log('sending mail successful: ' + result)
	} catch(error) {
		console.log('Error while sending email: ' + error)
		throw error
	}
}

const template = ""+
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
		.buttonCell {
			padding-top: 10px;
		}
		.button {
			color: #494949 !important;
			text-transform: uppercase;
			text-decoration: none;
			background: #ffffff;
			padding: 20px;
			border: 4px solid #494949 !important;
			display: inline-block;
			transition: all 0.4s ease 0s;
		}
		.button:hover {
			color: #ffffff !important;
			background: #f6b93b;
			border-color: #ffffff !important;
			transition: all 0.4s ease 0s;
		}
	</style>
</head>
<body>
<center>
	<center style="color: #000000; font-size: 11px; margin-bottom: 4px;">the following episodes aired between {{timespan.start}} and {{timespan.end}}.</center>

		 <table width="780" border="0" cellspacing="0" cellpadding="0">
			<tr>
				<td style="font-size:36pt; padding-top: 80px; padding-left: 85px; padding-right: 85px; padding-bottom: 25px">
					{{currentDate}}<br>
					The following episodes are now available:
				</td>
			</tr>
			{{#newEpisodes}}
			<tr>
				<td>
					<table class="transparentBackgroundTable" width="780" border="0" cellspacing="0" cellpadding="0">
						<tr>
							<td style="font-size:18pt; padding-top: 40px; padding-left: 85px; padding-right: 85px; padding-bottom: 15px">
								<b>{{seriesTitle}}</b>
							</td>
						</tr>
						<tr>
							<td style="font-size:12pt; padding-top: 5px; padding-left: 85px; padding-right: 85px; padding-bottom: 5px">
								<table class="transparentBackgroundTable">
								{{#episodes}}
									<tr>
										<td colspan="2">
											{{seriesTitle}} {{seasonEpisodeNotation}}: {{episodeTitle}}
										</td>
									<tr>
									<tr>
										{{#episodeImage}}
										<td style="width: 300px; height:168px">
											<img src="{{.}}" alt="" style="width: 100%"/>
										</td>
										{{/episodeImage}}
										<td style="height: 168px; overflow-y: auto">
											{{episodeSummary}}<br><br>exact airdate: {{episodeAirstamp}}.
										</td>
									</tr>
									<tr>
										<td class="buttonCell" align="center">
											<a class="button" href="{{showOnWebsiteUrl}}" target="_blank" rel="nofollow noopener">
												Open Website
											</a>
										</td>
										<td class="buttonCell" align="center">
											<a class="button" href="{{episodeWatchedUrl}}" target="_blank" rel="nofollow noopener">
												Mark as watched
											</a>
										</td>
									</tr>
								{{/episodes}}
								</table>
							</td>
						</tr>
						<tr>
							<td style="font-size:12pt; padding-top: 20px; padding-left: 85px; padding-right: 85px; padding-bottom: 15px">
								(<a href="{{turnOffNotificationsUrl}}">turn off notifications for this show</a>)
							</td>
						<tr>
					</table>
				<td>
			</tr>
			{{/newEpisodes}}
			<tr>
				<td>
					<br>
				</td>
			</tr>
		</table>
	
	<center style="color: #000000; font-size: 11px; margin-bottom: 4px;">some performance measurements:<br>db query: {{performance.timeDBQuery}}ms, db update: {{performance.timeUpdateSeries}}ms,<br>data gathering: {{performance.timeCreateObj}}ms, data transformation: {{performance.timeRewriteObject}}ms.</center>
	</center>
</center>
</body>
</html>
`