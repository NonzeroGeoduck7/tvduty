// userSeriesModel.js
// connects users and series
import mongoose from 'mongoose'
// Set UserSeries Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: {
    type: String,
    required: [true, 'userId field is required']
  },
  seriesId: {
    type: Number,
    required: [true, 'seriesId field is required']
  },
  numWatchedEpisodes: {
    type: Number,
    required: [true, 'numWatchedEpisodes field is required'],
    default: -1,
  },
  currentSeason: {
    type: Number,
    required: [true, 'currentSeason field is required'],
    default: 1,
  },
  receiveNotification: {
    type: Boolean,
    required: [true, 'receiveNotification field is required']
  },
  lastAccessed: {
    type: Date,
    required: false,
    default: new Date()
  },
}),
UserSeries = mongoose.model('userSeries', schema)
export default UserSeries
