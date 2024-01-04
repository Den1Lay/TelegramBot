const { Schema, default: mongoose, model } = require('mongoose');

const UserSchema = new Schema({
  username: String,
  showName: String,
  first_name: String,
  language_code: String,
  chatId: String, 
  msgId: String,
  lastSeen: {
    type: Date, 
    default: Date.now()
  },
  joinedTime: {
    type: Date,
    default: Date.now()
  },
  mbti: String,
  inTest: Boolean,

  visible: String,
  latitude: Number,
  longitude: Number,
  photo: String,
  showText: String,
  wish: String,
  rate: Number,
  resp: [String],
  checked: [String],
})

const user = model('User', UserSchema);

module.exports = user;