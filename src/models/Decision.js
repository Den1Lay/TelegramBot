const { Schema, default: mongoose, model } = require('mongoose');

const DecisionSchema = new Schema({
  comment: String,
  index: Number,
  nextNodeObj: {
    type: Schema.Types.ObjectId,
    ref: 'NodeObj',
    default: new mongoose.Types.ObjectId(),
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

const decision = model('Decision', DecisionSchema);

module.exports = decision;