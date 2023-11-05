const { Schema, default: mongoose, model } = require('mongoose');

const RoomSchema = new Schema({
  unique_name: String,
  historyId: {
    type: Schema.Types.ObjectId,
    ref: 'History'
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

const room = model('Room', RoomSchema);

module.exports = room;