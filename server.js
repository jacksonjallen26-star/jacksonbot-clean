require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Allow ALL origins temporarily for testing
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is alive");
});

app.post("/chat", (req, res) => {
  res.json({ reply: "Backend working." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Running on port " + PORT);
});