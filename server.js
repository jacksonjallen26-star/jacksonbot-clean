// server.js
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// =====================
// MongoDB Connection
// =====================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// =====================
// Company Schema
// =====================
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyId: { type: String, required: true, unique: true },

  // ✅ NEW: Editable from dashboard
  botName: { type: String, default: "Jet AI" },

  // SaaS controls
  active: { type: Boolean, default: true },
  plan: { type: String, default: "starter" },

  // Custom AI personality per company
  systemPrompt: {
    type: String,
    default: "You are Jet, a helpful and friendly AI assistant."
  },

  createdAt: { type: Date, default: Date.now }
});

const Company = mongoose.model("Company", companySchema);

// =====================
// Chat Schema
// =====================
const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  companyId: { type: String, required: true },
  role: { type: String, required: true }, // 'user' or 'bot'
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.model("Chat", chatSchema);

// =====================
// Middleware
// =====================
app.use(cors({
  origin: [
    "https://jacksonbot-clean.vercel.app",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST"]
}));

app.use(express.json());

// =====================
// Health Check
// =====================
app.get("/", (req, res) => {
  res.send("Backend is alive");
});

// =====================
// ✅ Update Settings Endpoint (NEW)
// =====================
app.post("/api/update-settings", async (req, res) => {
  try {
    const { companyId, botName } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: "companyId required" });
    }

    const updatedCompany = await Company.findOneAndUpdate(
      { companyId: companyId },
      { botName: botName },
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({ success: true, company: updatedCompany });

  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// =====================
// Chat Endpoint
// =====================
app.post("/chat", async (req, res) => {
  const { message, userId, companyId } = req.body;

  if (!companyId) return res.status(400).json({ reply: "Company ID required." });
  if (!message || !userId) return res.status(400).json({ reply: "Missing message or userId." });

  try {
    const company = await Company.findOne({ companyId });
    if (!company) return res.status(400).json({ reply: "Invalid company." });
    if (!company.active) return res.status(403).json({ reply: "Subscription inactive." });

    const previousMessages = await Chat.find({ userId, companyId })
      .sort({ timestamp: 1 })
      .limit(10);

    const historyForOpenAI = previousMessages.map(msg => ({
      role: msg.role === "bot" ? "assistant" : "user",
      content: msg.message
    }));

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: company.systemPrompt },
        ...historyForOpenAI,
        { role: "user", content: message }
      ],
    });

    const botReply = completion.choices[0].message.content;

    await Chat.create({ userId, companyId, role: "user", message });
    await Chat.create({ userId, companyId, role: "bot", message: botReply });

    res.json({ reply: botReply });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ reply: "Jet is having trouble right now." });
  }
});

// =====================
// History Endpoint
// =====================
app.get("/history", async (req, res) => {
  const { userId, companyId } = req.query;

  if (!userId || !companyId) return res.status(400).json([]);

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

// =====================
// Start Server
// =====================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));