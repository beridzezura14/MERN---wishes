const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoute = require("./routes/auth");
const wishesRoute = require("./routes/wishes");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// CommonJS-ში __dirname უკვე ხელმისაწვდომია, fileURLToPath საჭირო აღარ არის

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoute);
app.use("/api/wishes", wishesRoute);

// Serve React build
app.use(express.static(path.join(__dirname, "../client/dist")));

// Catch-all route for React Router
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
