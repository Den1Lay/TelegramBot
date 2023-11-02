const { Schema, default: mongoose, model } = require('mongoose');

const UserHistoryObjSchema = new Schema({
  history_id: {
    type: Schema.Types.ObjectId,
    ref: 'History'
  },
  current_pos: String
})

const userHistoryObj = model('UserHistoryObj', UserHistoryObjSchema);

module.exports = userHistoryObj;