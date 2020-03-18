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
  extId: {
    type: Number,
    required: [true, 'extId field is required']
  },
  imdbId: {
    type: String,
    required: false,
  },
  poster: {
    type: String,
    required: false,
  },
  nrOfAiredEpisodes: {
    type: Number,
    required: false,
  },
  status: {
    type: String,
    required: [true, 'status field is required'],
  },
  lastUpdated: {
    type: Date,
    required: false,
    default: new Date,
  },
  nextEpisodeAirstamp: {
    type: Date,
    required: false,
  },
  nextEpisodeNotation: {
    type: String,
    required: false,
  }
}),
Series = mongoose.model('series', schema)
export default Series
