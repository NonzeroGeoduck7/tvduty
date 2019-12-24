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
  poster: {
    type: String,
    required: false,
  },
  nrOfEpisodes: {
    type: Number,
    required: false,
  },
  status: {
    type: String,
    required: [true, 'status field is required'],
  },
  lastAccessed: {
    type: Date,
    required: false,
    default: new Date()
  },
  lastUpdated: {
    type: Date,
    required: false,
    default: new Date
  },
}),
Series = mongoose.model('series', schema)
export default Series
