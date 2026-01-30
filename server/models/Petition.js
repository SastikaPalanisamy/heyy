const mongoose = require("mongoose");

const PetitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: "General" },
  location: { type: String, default: "Sathy" },
  author: { type: String, required: true },
  targetSignatures: { type: Number, default: 100 },
  currentSignatures: { type: Number, default: 0 },
  signers: [{ type: String }], // User IDs or Names store panna array
}, { timestamps: true });

module.exports = mongoose.model("Petition", PetitionSchema);