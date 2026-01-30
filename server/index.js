require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const petitionRoutes = require("./routes/petitions");
const pollRoutes = require("./routes/polls");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Database Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/petitions", petitionRoutes); // Ippo register panniyaachu
app.use("/api/polls", pollRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));