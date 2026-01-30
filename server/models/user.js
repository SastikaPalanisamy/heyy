const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, lowercase: true, required: true },
  location: { type: String },
  role: { type: String, enum: ["Citizen", "Official"], default: "Citizen" },
  password: { type: String, required: true },
  otp: String,
  otpExpiry: Date
});

module.exports = mongoose.model("User", userSchema);
