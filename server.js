// server.js

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // 👈 ADD THIS
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

// ===== CONNECT TO MONGODB =====
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// ===== MIDDLEWARE =====
app.use(cors({
  origin: "https://jacksonbot-clean.vercel.app",
  methods: ["GET", "POST"],
}));

app.use(express.json());

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.send("Backend is alive");
});

// ===== CHAT ENDPOINT =====
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "No message provided." });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are Jet, a helpful and friendly AI assistant."
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({
      reply: "Jet is having trouble right now."
    });
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});