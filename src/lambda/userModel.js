// userModel.js
// user - Settings
import mongoose from 'mongoose'
// Set User Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: {
    type: String,
    required: [true, 'userId field is required']
  },
  email: {
    type: String,
    required: [false, 'email field is required']
  },
})

export default mongoose.model('user', schema)
