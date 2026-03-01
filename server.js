// server.js

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

// ===== CONNECT TO MONGODB =====
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// ===== CHAT SCHEMA =====
const chatSchema = new mongoose.Schema({
  companyId: String,      // optional: separate chats per company
  userId: String,         // optional: separate chats per user
  role: String,           // "user" or "bot"
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.model("Chat", chatSchema);

// ===== MIDDLEWARE =====
app.use(cors({
  origin: "https://jacksonbot-clean.vercel.app", // your frontend URL
  methods: ["GET", "POST"],
}));
app.use(express.json());

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.send("Backend is alive");
});

// ===== CHAT ENDPOINT (with memory) =====
app.post("/chat", async (req, res) => {
  const { message, userId = "guest", companyId = "default" } = req.body;

  if (!message) return res.status(400).json({ reply: "No message provided." });

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Load last 10 messages for this user/company
    const previousMessages = await Chat.find({ userId, companyId })
                                       .sort({ timestamp: 1 })
                                       .limit(10);

    // Format for OpenAI
    const historyForOpenAI = previousMessages.map(msg => ({
      role: msg.role,
      content: msg.message
    }));

    // Send to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Jet, a helpful and friendly AI assistant." },
        ...historyForOpenAI,
        { role: "user", content: message }
      ]
    });

    const botReply = completion.choices[0].message.content;

    // Save user message & bot reply
    await Chat.create({ userId, companyId, role: "user", message });
    await Chat.create({ userId, companyId, role: "bot", message: botReply });

    res.json({ reply: botReply });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ reply: "Jet is having trouble right now." });
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});