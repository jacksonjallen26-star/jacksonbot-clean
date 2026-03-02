// server.js
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// ===== MONGODB SETUP =====
mongoose.connect(process.env.MONGODB_URI, {
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const Company = mongoose.model("Company", companySchema);

// ===== CHAT SCHEMA =====
const chatSchema = new mongoose.Schema({
  userId: String,
  companyId: { type: String, required: true },
  role: String,             // 'user' or 'bot'
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);

// ===== MIDDLEWARE =====
app.use(cors({
  origin: "https://jacksonbot-clean.vercel.app", // your frontend
  methods: ["GET", "POST"],
}));
app.use(express.json());

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.send("Backend is alive");
});

// ===== CHAT ENDPOINT =====
app.post("/chat", async (req, res) => {
  const { message, userId, companyId } = req.body;

  if (!companyId) {
  return res.status(400).json({ reply: "Company ID required." });
}

  if (!message) return res.status(400).json({ reply: "No message provided." });

  try {
    // ===== Load last 10 messages for context =====
    let previousMessages = [];
    try {
      previousMessages = await Chat.find({ userId, companyId })
                                   .sort({ timestamp: 1 })
                                   .limit(10);
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }

    // ===== Map roles for OpenAI =====
    const historyForOpenAI = previousMessages.map(msg => ({
      role: msg.role === "bot" ? "assistant" : msg.role,
      content: msg.message
    }));

    // ===== OpenAI request =====
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Jet, a helpful and friendly AI assistant." },
        ...historyForOpenAI,
        { role: "user", content: message }
      ],
    });

    const botReply = completion.choices[0].message.content;

    // ===== Save user message and bot reply =====
    await Chat.create({ userId, companyId, role: "user", message, timestamp: new Date() });
    await Chat.create({ userId, companyId, role: "bot", message: botReply, timestamp: new Date() });

    res.json({ reply: botReply });

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ reply: "Jet is having trouble right now." });
  }
});

// ===== HISTORY ENDPOINT =====
app.get("/history", async (req, res) => {
  const { userId, companyId} = req.query;
  if (!companyId) return res.status(400).json([]);

  try {
    const previousMessages = await Chat.find({ userId, companyId })
                                       .sort({ timestamp: 1 });
    res.json(previousMessages.map(msg => ({
      type: msg.role === "bot" ? "bot" : "user",
      text: msg.message,
      timestamp: msg.timestamp
    })));
  } catch (err) {
    console.error("Failed to load chat history:", err);
    res.status(500).json([]);
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));