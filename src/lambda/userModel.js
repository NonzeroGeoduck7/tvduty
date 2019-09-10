// userModel.js
// user - notification infos
import mongoose from 'mongoose'
// Set User Schema
const schema = new mongoose.Schema({
        _id: mongoose.Schema.Types.ObjectId,
        userId: {
          type: String,
          required: [true, 'userId field is required']
        },
        notificationId: {
          type: Number,
          required: [true, 'notificationId field is required']
        }
      }),
      User = mongoose.model('user', schema)
export default User
