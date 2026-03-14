// ===============================
// IMPORTS
// ===============================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const OpenAI = require("openai");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
require("dotenv").config();

const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.json());

app.use(cors({
  origin: [
    "https://jacksonbot-clean.vercel.app",
    "https://jacksonbot-dashboard.vercel.app/login",
    "http://localhost:3000",
    "http://127.0.0.1:5500"
  ],
  methods: ["GET", "POST"]
}));

// ===============================
// MONGODB CONNECTION
// ===============================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ===============================
// COMPANY SCHEMA (SaaS Core)
// ===============================
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password : { type: String, required: true },

  // Branding / Theme
  botName: { type: String, default: "Jet AI" },
  logoUrl: { type: String, default: "" },

  primaryColor: { type: String, default: "#4f46e5" },
  secondaryColor: { type: String, default: "#6366f1" },
  accentColor: { type: String, default: "#4338ca" },
  textColor: { type: String, default: "#ffffff" },
  botBubbleColor: { type: String, default: "#2a2a2a" },

  // AI Personality
  systemPrompt: {
    type: String,
    default: "You are Jet, a helpful and friendly AI assistant."
  },

  // SaaS Controls
  active: { type: Boolean, default: true },
  plan: { type: String, default: "starter" },

  createdAt: { type: Date, default: Date.now }
});

const Company = mongoose.model("Company", companySchema);

// ===============================
// CHAT HISTORY SCHEMA
// ===============================
const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  companyId: { type: String, required: true },
  role: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.model("Chat", chatSchema);

// ===============================
// AUTH MIDDLEWARE
// ===============================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader)
    return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ error: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.companyId = decoded.companyId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};


// ===============================
// HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
  res.send("🚀 Backend is running");
});

  


// ===============================
// REGISTER COMPANY
// ===============================

app.post("/api/register", async (req, res) => {
  try {
    const { name, companyId, email, password } = req.body;

    if (!name || !companyId || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    const existing = await Company.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const company = await Company.create({
      name,
      companyId,
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      { companyId: company.companyId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, companyId: company.companyId });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// LOGIN
// ===============================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const company = await Company.findOne({ email });
    if (!company)
      return res.status(404).json({ error: "Company not registered" });

    const passwordMatch = await bcrypt.compare(password, company.password);
    if (!passwordMatch)
      return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
      { companyId: company.companyId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, companyId: company.companyId });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// UPDATE COMPANY SETTINGS
// ===============================
app.post("/api/update-settings", authenticateToken, async (req, res) => {
  try {
    const companyId = req.companyId;
    const {
      botName,
      logoUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      textColor,
      botBubbleColor,
      systemPrompt
    } = req.body;

  

    const updatedCompany = await Company.findOneAndUpdate(
      { companyId },
      {
        botName,
        logoUrl,
        primaryColor,
        secondaryColor,
        accentColor,
        textColor,
        botBubbleColor,
        systemPrompt
      },
      { new: true }
    );

    if (!updatedCompany)
      return res.status(404).json({ error: "Company not found" });

    res.json({ success: true, settings: updatedCompany });

  } catch (err) {
    console.error("Update Settings Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// GET COMPANY SETTINGS (Widget)
// ===============================
app.get("/api/get-settings", async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId)
      return res.status(400).json({ error: "companyId required" });

    const company = await Company.findOne({ companyId });

    if (!company)
      return res.status(404).json({ error: "Company not found" });

    res.json({
      botName: company.botName,
      logoUrl: company.logoUrl,
      primaryColor: company.primaryColor,
      secondaryColor: company.secondaryColor,
      accentColor: company.accentColor,
      textColor: company.textColor,
      botBubbleColor: company.botBubbleColor,
      systemPrompt: company.systemPrompt
    });

  } catch (err) {
    console.error("Get Settings Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// CHAT ENDPOINT
// ===============================
app.post("/chat", async (req, res) => {
  const { message, userId, companyId } = req.body;

  if (!message || !userId || !companyId)
    return res.status(400).json({ reply: "Missing required fields." });

  try {
    const company = await Company.findOne({ companyId });

    if (!company)
      return res.status(400).json({ reply: "Invalid company." });

    if (!company.active)
      return res.status(403).json({ reply: "Subscription inactive." });

    const previousMessages = await Chat.find({ userId, companyId })
      .sort({ timestamp: 1 })
      .limit(10);

    const history = previousMessages.map(msg => ({
      role: msg.role === "bot" ? "assistant" : "user",
      content: msg.message
    }));

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: company.systemPrompt },
        ...history,
        { role: "user", content: message }
      ]
    });

    const botReply = completion.choices[0].message.content;

    await Chat.create({ userId, companyId, role: "user", message });
    await Chat.create({ userId, companyId, role: "bot", message: botReply });

    res.json({ reply: botReply });

  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ reply: "Jet is having trouble right now." });
  }
});

// ===============================
// LOAD CHAT HISTORY
// ===============================
app.get("/history", authenticateToken, async (req, res) => {
  const { userId, companyId } = req.query;

  if (!userId || !companyId)
    return res.status(400).json([]);

  try {
    const messages = await Chat.find({ userId, companyId })
      .sort({ timestamp: 1 });

    res.json(messages.map(msg => ({
      type: msg.role === "bot" ? "bot" : "user",
      text: msg.message,
      timestamp: msg.timestamp
    })));

  } catch (err) {
    console.error("History Error:", err);
    res.status(500).json([]);
  }
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});