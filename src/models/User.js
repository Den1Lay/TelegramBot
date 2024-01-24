const { Schema, default: mongoose, model } = require('mongoose');

const UserSchema = new Schema({
  username: String,
  showName: String,
  first_name: String,
  language_code: String,
  chatId: String, 
  msgId: String,
  mySex: String,
  findSex: String,
  lastSeen: {
    type: Date, 
    default: Date.now()
  },
  joinedTime: {
    type: Date,
    default: Date.now()
  },
  mbti: String,
  mbtiData: {
    type: Schema.Types.ObjectId,
    ref: 'MbtiData'
  },
  searchType: String,
  inTest: Boolean,

  firstStart: {
    type: Boolean,
    default: true,
  },

  visible: String,
  latitude: Number,
  longitude: Number,
  photo: String,
  showText: String,
  wish: String,
  rate: Number,
  resp: [String],
  checked: [String],
  location_range: Number,
  searchLike: {
    type: Number,
    default: 5
  },
  acceptLike: {
    type: Number,
    default: 5
  },
  lastLikeUpdate: {
    type: Date,
    default: Date.now()
  },
  deathLikes: {
    type: Number,
    default: 0
  },
  resLikes: [String]
})

const user = model('User', UserSchema);

module.exports = user;