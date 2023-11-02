const { Schema, default: mongoose, model } = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const HistorySchema = new Schema({
  name: String,
  unique_name: String,
  language_code: String,
  comment: String,
  zero_node: {
    type: Schema.Types.ObjectId,
    ref: 'NodeObj',
    default: new mongoose.Types.ObjectId(),
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

const history = model('History', HistorySchema);

module.exports = history;