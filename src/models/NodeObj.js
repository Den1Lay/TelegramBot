const { Schema, default: mongoose, model } = require('mongoose');

const NodeObjSchema = new Schema({
  historyId: {
    type: Schema.Types.ObjectId,
    ref: 'History'
  },
  text: String,
  decisions:[
    {
      type: Schema.Types.ObjectId,
      ref: 'Decision'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

const nodeObj = model('NodeObj', NodeObjSchema);

module.exports = nodeObj;