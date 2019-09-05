// seriesModel.js
// general series stats
import mongoose from 'mongoose'
// Set Series Schema
const schema = new mongoose.Schema({
        _id: mongoose.Schema.Types.ObjectId,
        title: {
          type: String,
          required: [true, 'title field is required'],
          max: 100
        },
        nrOfEpisodes: {
          type: Number,
          required: [true, 'nrOfEpisodes field is required']
        },
		extId: {
		  type: Number,
		  required: [true, 'extId field is required']
		},
		poster: {
		  type: String,
		  required: false,
		},
	    status: {
		  type: String,
		  required: [true, 'status field is required'],
		},
        lastUpdated: {
            type: Date,
			required: [true, 'lastUpdated field is required'],
            default: Date.now
        },
	    // last episode out??
      }),
      Series = mongoose.model('series', schema)
export default Series
