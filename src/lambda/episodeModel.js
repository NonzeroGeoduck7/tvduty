// episodeModel.js
// general episode stats
import mongoose from 'mongoose'
// Set Episodes Schema
const schema = new mongoose.Schema({
        _id: mongoose.Schema.Types.ObjectId,
        title: {
          type: String,
          required: [true, 'title field is required'],
          max: 100
        },
	    extId: {
		  type: Number,
		  required: [true, 'extId field is required']
		},
        seasonNr: {
          type: Number,
          required: [true, 'seasonNr field is required']
        },
		episodeNr: {
          type: Number,
          required: [true, 'episodeNr field is required']
        },
		seriesId: {
		  type: Number,
		  required: [true, 'extId field is required']
		},
		image: {
		  type: String,
		  required: false,
		},
	    airstamp: {
		  type: String,
		  required: false,
		},
        summary: {
            type: String,
			required: false
        },
      }),
      Episodes = mongoose.model('episodes', schema)
export default Episodes
