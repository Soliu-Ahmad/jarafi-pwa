const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PinSchema = new Schema({
  wallet: {
    type: String,
    required: true,
    unique: true,
  },
  pin: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
});

const Pin = mongoose.model("Pin", PinSchema);
module.exports = Pin;
