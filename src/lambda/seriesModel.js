// seriesModel.js
import mongoose from 'mongoose'
// Set Product Schema
const schema = new mongoose.Schema({
        _id: mongoose.Schema.Types.ObjectId,
        title: {
          type: String,
          required: false,
          max: 100
        },
        nrOfEpisodes: {
          type: Number,
          required: false//[true, 'nrOfEpisodes field is required']
        },
 //       date: {
 //           type: Date,
 //           default: Date.now
 //       },
      }),
      Series = mongoose.model('series', schema)
export default Series
