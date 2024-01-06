const { Schema, default: mongoose, model } = require('mongoose');

const MbtiDataSchema = new Schema({
  lastSeen: {
    type: Date, 
    default: Date.now()
  },
  joinedTime: {
    type: Date,
    default: Date.now()
  },
  stage: {
    type: Number,
    default: 0
  },
  step: {
    type: Number,
    default: 0
  },
  Ni: {
    type: Number,
    default: 0
  },
  Ne: {
    type: Number,
    default: 0
  },
  Si: {
    type: Number,
    default: 0
  },
  Se: {
    type: Number,
    default: 0
  },
  Ti: {
    type: Number,
    default: 0
  },
  Te: {
    type: Number,
    default: 0
  },
  Fi: {
    type: Number,
    default: 0
  },
  Fe: {
    type: Number,
    default: 0
  },

  NiP: {
    type: Number,
    default: 0
  },
  NeP: {
    type: Number,
    default: 0
  },
  SiP: {
    type: Number,
    default: 0
  },
  SeP: {
    type: Number,
    default: 0
  },
  TiP: {
    type: Number,
    default: 0
  },
  TeP: {
    type: Number,
    default: 0
  },
  FiP: {
    type: Number,
    default: 0
  },
  FeP: {
    type: Number,
    default: 0
  },
  
  NiM: {
    type: Number,
    default: 0
  },
  NeM: {
    type: Number,
    default: 0
  },
  SiM: {
    type: Number,
    default: 0
  },
  SeM: {
    type: Number,
    default: 0
  },
  TiM: {
    type: Number,
    default: 0
  },
  TeM: {
    type: Number,
    default: 0
  },
  FiM: {
    type: Number,
    default: 0
  },
  FeM: {
    type: Number,
    default: 0
  },

  I: {
    type: Number,
    default: 0
  },
  E: {
    type: Number,
    default: 0
  },
})

const mbtiData = model('MbtiData', MbtiDataSchema);

module.exports = mbtiData;