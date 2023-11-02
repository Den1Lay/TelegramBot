const { Schema, default: mongoose, model } = require('mongoose');

const UserSchema = new Schema({
  username: String,
  first_name: String,
  language_code: String,
  lastSeen: {
    type: Date, 
    default: Date.now()
  },
  joinedTime: {
    type: Date,
    default: Date.now()
  },
  currentHistory: String,
  histories: [
    {
      type: Schema.Types.ObjectId,
      ref: 'UserHistoryObj'
    }
  ]
})

const user = model('User', UserSchema);

module.exports = user;