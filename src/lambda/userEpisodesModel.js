// userEpisodesModel.js
// which user has watched which episode
import mongoose from 'mongoose'

const schema = new mongoose.Schema({
        _id: mongoose.Schema.Types.ObjectId,
        userId: {
          type: String,
          required: [true, 'userId field is required']
		},
		// this is the extId from tvmaze
	    episodeId: {
		  type: Number,
		  required: [true, 'episodeId field is required']
		},
		timeWatched: {
		  type: Date,
		  required: true,
		},
      }),
      UserEpisodesModel = mongoose.model('userEpisodes', schema)
export default UserEpisodesModel
