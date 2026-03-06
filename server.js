// ===============================
// IMPORTS
// ===============================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { Configuration, OpenAIApi } = require("openai");
const multer = require("multer");
const pdfParse = require("pdf-parse");
require("dotenv").config();

const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.json());

app.use(cors({
  origin: [
    "https://jacksonbot-clean.vercel.app",
    "http://localhost:3000"
  ],
  methods: ["GET","POST"]
}));

// ===============================
// MONGODB CONNECTION
// ===============================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ===============================
// SCHEMAS
// ===============================

// Company Schema
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyId: { type: String, required: true, unique: true },
  botName: { type: String, default: "Jet AI" },
  logoUrl: { type: String, default: "" },
  primaryColor: { type: String, default: "#4f46e5" },
  secondaryColor: { type: String, default: "#6366f1" },
  accentColor: { type: String, default: "#4338ca" },
  textColor: { type: String, default: "#ffffff" },
  botBubbleColor: { type: String, default: "#2a2a2a" },
  systemPrompt: { type: String, default: "You are Jet, a helpful and friendly AI assistant." },
  openingMessage: { type: String, default: "Hi! 👋 How can I help you today?" },
  active: { type: Boolean, default: true },
  plan: { type: String, default: "starter" },
  createdAt: { type: Date, default: Date.now }
});
const Company = mongoose.model("Company", companySchema);

// Chat Schema
const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  companyId: { type: String, required: true },
  role: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
const Chat = mongoose.model("Chat", chatSchema);

// PDF Chunk Schema
const pdfChunkSchema = new mongoose.Schema({
  companyId: { type: String, required: true },
  chunk: { type: String, required: true },
  vector: { type: [Number], required: true },
  createdAt: { type: Date, default: Date.now }
});
const PdfChunk = mongoose.model("PdfChunk", pdfChunkSchema);

// ===============================
// OPENAI CONFIG
// ===============================
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

// ===============================
// MULTER MEMORY STORAGE (Railway friendly)
// ===============================
const upload = multer({ storage: multer.memoryStorage() });

// ===============================
// HEALTH CHECK
// ===============================
app.get("/", (req, res) => res.send("🚀 Backend is running"));

// ===============================
// CREATE COMPANY
// ===============================
app.post("/api/create-company", async (req, res) => {
  try {
    const { name, companyId } = req.body;
    if (!name || !companyId) return res.status(400).json({ error: "Name and companyId required" });

    const existing = await Company.findOne({ companyId });
    if (existing) return res.status(400).json({ error: "Company already exists" });

    const newCompany = await Company.create({ name, companyId });
    res.json({ success: true, company: newCompany });
  } catch (err) {
    console.error("Create Company Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// UPDATE COMPANY SETTINGS
// ===============================
app.post("/api/update-settings", async (req, res) => {
  try {
    const { companyId, botName, logoUrl, primaryColor, secondaryColor, accentColor, textColor, botBubbleColor, systemPrompt, openingMessage } = req.body;
    if (!companyId) return res.status(400).json({ error: "companyId required" });

    const updatedCompany = await Company.findOneAndUpdate(
      { companyId },
      { botName, logoUrl, primaryColor, secondaryColor, accentColor, textColor, botBubbleColor, systemPrompt, openingMessage },
      { new: true }
    );

    if (!updatedCompany) return res.status(404).json({ error: "Company not found" });
    res.json({ success: true, settings: updatedCompany });
  } catch (err) {
    console.error("Update Settings Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// GET COMPANY SETTINGS
// ===============================
app.get("/api/get-settings", async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ error: "companyId required" });

    const company = await Company.findOne({ companyId });
    if (!company) return res.status(404).json({ error: "Company not found" });

    res.json({
      botName: company.botName,
      logoUrl: company.logoUrl,
      primaryColor: company.primaryColor,
      secondaryColor: company.secondaryColor,
      accentColor: company.accentColor,
      textColor: company.textColor,
      botBubbleColor: company.botBubbleColor,
      systemPrompt: company.systemPrompt,
      openingMessage: company.openingMessage
    });
  } catch (err) {
    console.error("Get Settings Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// UPLOAD PDF AND CREATE EMBEDDINGS
// ===============================
app.post("/api/upload-pdf", upload.single("pdf"), async (req, res) => {
  try {
    const { companyId } = req.body;
    const file = req.file;
    if (!file || !companyId) return res.status(400).json({ success: false, error: "Missing file or companyId" });

    const pdfData = await pdfParse(file.buffer);
    const text = pdfData.text;
    if (!text || !text.trim()) return res.status(400).json({ success: false, error: "PDF has no text" });

    // Split text into chunks
    const chunkSize = 500; // characters
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    // Create embeddings and store in Mongo
    const embeddings = [];
    for (const chunk of chunks) {
      const embRes = await openai.embeddings.create({ input: chunk, model: "text-embedding-3-small" });
      embeddings.push({ companyId, chunk, vector: embRes.data[0].embedding });
    }

    await PdfChunk.insertMany(embeddings);
    res.json({ success: true, chunksStored: chunks.length });

  } catch (err) {
    console.error("PDF upload error:", err);
    res.status(500).json({ success: false, error: "Failed to process PDF" });
  }
});

// ===============================
// CHAT ENDPOINT
// ===============================
app.post("/chat", async (req, res) => {
  const { message, userId, companyId } = req.body;
  if (!message || !userId || !companyId) return res.status(400).json({ reply: "Missing required fields." });

  try {
    const company = await Company.findOne({ companyId });
    if (!company) return res.status(400).json({ reply: "Invalid company." });
    if (!company.active) return res.status(403).json({ reply: "Subscription inactive." });

    const previousMessages = await Chat.find({ userId, companyId }).sort({ timestamp: 1 }).limit(10);
    const history = previousMessages.map(msg => ({ role: msg.role === "bot" ? "assistant" : "user", content: msg.message }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: company.systemPrompt }, ...history, { role: "user", content: message }]
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
app.get("/history", async (req, res) => {
  const { userId, companyId } = req.query;
  if (!userId || !companyId) return res.status(400).json([]);

  try {
    const messages = await Chat.find({ userId, companyId }).sort({ timestamp: 1 });
    res.json(messages.map(msg => ({ type: msg.role === "bot" ? "bot" : "user", text: msg.message, timestamp: msg.timestamp })));
  } catch (err) {
    console.error("History Error:", err);
    res.status(500).json([]);
  }
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));