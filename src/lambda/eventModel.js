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
  userId: {
    type: String,
    required: [true, 'userId field is required']
  },
  seriesId: {
    type: Number,
    required: [true, 'seriesId field is required']
  },
  seasonNr: {
    type: Number,
    required: [true, 'seasonNr field is required'],
  },
  episodeNr: {
    type: Number,
    required: [true, 'episodeNr field is required'],
  },
  dateEventCreated: {
    type: String,
    required: [true, 'dateEventCreated field is required']
  },
})

export default mongoose.model('events', schema)
