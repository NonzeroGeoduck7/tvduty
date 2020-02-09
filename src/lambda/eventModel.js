// eventModel.js
// eventList to mark episodes as watched from url
import mongoose from 'mongoose'
// Set Event Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  eventUid: {
    type: String,
    required: [true, 'eventUid field is required']
  },
  eventType: {
    type: Number,
    required: [true, 'eventType field required']
  },
  userId: {
    type: String,
    required: [true, 'userId field is required']
  },
  seriesId: {
    type: Number,
    required: [true, 'seriesId field is required']
  },
  episodeId: {
    type: Number,
    required: [false]
  },
  dateEventCreated: {
    type: String,
    required: [true, 'dateEventCreated field is required']
  },
  dateEventProcessed: {
    type: String,
    required: [false],
  }
})

export default mongoose.model('events', schema)
