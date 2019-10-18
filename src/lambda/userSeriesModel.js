// userSeriesModel.js
// connects users and series
import mongoose from 'mongoose'
// Set UserSeries Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: {
    type: String,
    required: [true, 'user field is required']
  },
  seriesId: {
    type: Number,
    required: [true, 'seriesId field is required']
  },
  currentEpisode: {
    type: Number,
    required: [true, 'currentEpisode field is required']
  },
  receiveNotification: {
    type: Boolean,
    required: [true, 'receiveNotification field is required']
  },
}),
UserSeries = mongoose.model('userSeries', schema)
export default UserSeries
