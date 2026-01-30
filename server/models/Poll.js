const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  options: [{ text: String, votes: { type: Number, default: 0 } }],
  author: String,
  voters: { type: [{ userId: String, optionIndex: Number }], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Poll', PollSchema);
