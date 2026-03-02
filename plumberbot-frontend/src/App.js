// server.js
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// ===== MONGODB SETUP =====
mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// ===== COMPANY SCHEMA =====
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
  role: String, // 'user' or 'bot'
  message: String,
  timestamp: { type: Date, default: Date.now },
});
const Chat = mongoose.model("Chat", chatSchema);

// ===== MIDDLEWARE =====
app.use(cors({
  origin: "https://jacksonbot-clean.vercel.app", // frontend URL
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

  console.log("Incoming chat:", { message, userId, companyId });

  if (!companyId) return res.status(400).json({ reply: "Company ID required." });
  if (!message) return res.status(400).json({ reply: "No message provided." });

  // Verify company exists
  const companyExists = await Company.findOne({ companyId });
  console.log("Company exists?", !!companyExists);
  if (!companyExists) return res.status(400).json({ reply: "Invalid company ID." });

  try {
    // Load last 10 messages for context
    const previousMessages = await Chat.find({ userId, companyId })
                                       .sort({ timestamp: 1 })
                                       .limit(10);
    console.log("Previous messages loaded:", previousMessages.length);

    // OpenAI request
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Jet, a helpful and friendly AI assistant." },
        ...previousMessages.map(msg => ({
          role: msg.role === "bot" ? "assistant" : msg.role,
          content: msg.message
        })),
        { role: "user", content: message }
      ],
    });

    const botReply = completion.choices[0].message.content;

    // Save messages with logging
    try {
      const savedUser = await Chat.create({ userId, companyId, role: "user", message, timestamp: new Date() });
      console.log("Saved user message:", savedUser);
      const savedBot = await Chat.create({ userId, companyId, role: "bot", message: botReply, timestamp: new Date() });
      console.log("Saved bot message:", savedBot);
    } catch (err) {
      console.error("Failed to save chat:", err.message);
    }

    res.json({ reply: botReply });

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ reply: "Jet is having trouble right now." });
  }
});

// ===== HISTORY ENDPOINT =====
app.get("/history", async (req, res) => {
  const { userId, companyId } = req.query;
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

// ===== TEMP ROUTE TO VIEW LAST 20 CHATS FOR DEBUGGING =====
app.get("/view-chats/:companyId", async (req, res) => {
  try {
    const chats = await Chat.find({ companyId: req.params.companyId })
                            .sort({ timestamp: -1 })
                            .limit(20);
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));