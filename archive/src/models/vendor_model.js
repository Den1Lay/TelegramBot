const { Schema, default: mongoose } = require('mongoose');

const VendorSchema = new Schema({
  macPrefix: String,
  vendorName: String,
  private: Boolean,
  blockType: String,
  lastUpdate: String
})

const vendors = mongoose.model('vendor', VendorSchema);

module.exports = vendors