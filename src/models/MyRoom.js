const { Schema, default: mongoose, model } = require('mongoose');

const MyRoomSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  room_id: {
    type: Schema.Types.ObjectId,
    ref: 'Room'
  },
  history_id: {
    type: Schema.Types.ObjectId,
    ref: 'History'
  },
  visible: Boolean,
  notification: Boolean,
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

const myRoom = model('MyRoom', MyRoomSchema);

module.exports = myRoom;