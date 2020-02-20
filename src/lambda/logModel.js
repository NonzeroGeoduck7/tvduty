// logModel.js
import mongoose from 'mongoose'
// Set Log Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  logType: {
    type: Number,
    required: [true, 'logType field is required']
  },
  logDate: {
    type: Date,
    required: [true, 'logDate field is required']
  },
  dbUpdateDuration: {
    type: Number,
    required: [false]
  },
  numSeriesUpdated: {
    type: Number,
    required: [false]
  },
  numEmailsSent: {
    type: Number,
    required: [false]
  },
})

export default mongoose.model('log', schema)
