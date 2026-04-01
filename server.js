// ===============================
// IMPORTS
// ===============================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const OpenAI = require("openai");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const rateLimit = require("express-rate-limit");
const sanitizeHtml = require("sanitize-html");
const { Pinecone } = require("@pinecone-database/pinecone");
const PDFParser = require("pdf2json");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const crypto = require("crypto");
const multer = require("multer");
require("dotenv").config();

const app = express();

// ===============================
// PINECONE + UPLOAD CONFIG
// ===============================
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const upload = multer({ storage: multer.memoryStorage() });

// ===============================
// MIDDLEWARE
// ===============================
app.use("/api/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10kb" }));

app.use(cors({
  origin: async function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);

    // Always allow your own domains
    const alwaysAllowed = [
      "https://jacksonbot-clean.vercel.app",
      "https://jacksonbot-dashboard.vercel.app",
      "https://askra.app",
      "https://www.askra.app",
      "https://app.askra.app"
    ];

    if (alwaysAllowed.includes(origin)) return callback(null, true);

    // Check if origin matches any registered company's website
    try {
      const company = await Company.findOne({ websiteUrl: origin });
      if (company) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    } catch (err) {
      callback(new Error("CORS lookup failed"));
    }
  },
  methods: ["GET", "POST", "DELETE"],
}));

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { reply: "Too many messages. Please wait a few minutes before trying again." }
});

const historyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: []
});

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
  websiteUrl: { type: String, default: "" },

  // Branding / Theme
  botName: { type: String, default: "Askra" },
  logoUrl: { type: String, default: "" },

  primaryColor: { type: String, default: "#000000" },
  secondaryColor: { type: String, default: "#7c3aed" },
  accentColor: { type: String, default: "#52188B" },
  textColor: { type: String, default: "#ffffff" },
  botBubbleColor: { type: String, default: "#2a2a2a" },
  bubbleLogoUrl: { type: String, default: "https://app.askra.app/logo.png" },
  bubbleColor: { type: String, default: "#7c3aed" },
  openingMessage: { type: String, default: "" },
  passwordResetToken: { type: String, default: null },
  passwordResetExpiry: { type: Date, default: null },
  stripeCustomerId: { type: String, default: null },

  // AI Personality
  systemPrompt: {
    type: String,
    default: "You are Askra, a helpful and friendly AI assistant."
  },

  // SaaS Controls
  active: { type: Boolean, default: true },
  pending: { type: Boolean, default: false },
  plan: { type: String, default: "free" },
  role: { type: String, default: "user" },


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
// PDF UPLOAD SCHEMA
// ===============================
const pdfSchema = new mongoose.Schema({
  companyId: { type: String, required: true },
  fileName: { type: String, required: true },
  chunkCount: { type: Number, required: true },
  uploadId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const PdfUpload = mongoose.model("PdfUpload", pdfSchema);

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
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

    const requireAdmin = (req, res, next) => {
    if (req.userRole !== "admin")
    return res.status(403).json({ error: "Admin access required" });
    next();
};

// ===============================
// PLAN LIMITS
// ===============================
const PLAN_LIMITS = {
  free:    { messages: 100,    pdfs: 1  },
  starter: { messages: 5000,   pdfs: 10 },
  pro:     { messages: 50000,  pdfs: 75 }
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
    const { name, email, password, plan } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    if (password.length < 8)
      return res.status(400).json({ error: "Password must be at least 8 characters" });

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid)
      return res.status(400).json({ error: "Invalid email format" });

    const existing = await Company.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already registered" });

    // Free plan — create account immediately as before
    if (!plan || plan === "free") {
      const baseId = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      const suffix = Math.random().toString(36).slice(2, 7);
      const companyId = `${baseId}-${suffix}`;
      const hashedPassword = await bcrypt.hash(password, 10);

      const company = await Company.create({
        name,
        companyId,
        email,
        password: hashedPassword,
        plan: "free"
      });

      await resend.emails.send({
        from: "Askra <noreply@askra.app>",
        to: email,
        subject: "Welcome to Askra 🎉",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Welcome to Askra, ${name}!</h2>
            <p>Your account is set up and your bot is ready to go.</p>
            <ol>
              <li style="margin-bottom: 8px;">Upload a PDF with information about your business</li>
              <li style="margin-bottom: 8px;">Set your system prompt to describe how your bot should behave</li>
              <li style="margin-bottom: 8px;">Copy your embed code and paste it on your website</li>
            </ol>
            <a href="https://app.askra.app/dashboard" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">Go to Dashboard</a>
            <p style="color: #888; font-size: 13px;">Your Company ID: ${companyId}</p>
          </div>
        `
      });

      const token = jwt.sign(
        { companyId: company.companyId, role: company.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({ success: true, token, companyId: company.companyId, role: company.role });
    }

    // Paid plan — create pending account in DB, then redirect to Stripe
    // Never store credentials in Stripe metadata
    const hashedPassword = await bcrypt.hash(password, 10);
    const baseId = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const suffix = Math.random().toString(36).slice(2, 7);
    const companyId = `${baseId}-${suffix}`;

    await Company.create({
      name,
      companyId,
      email,
      password: hashedPassword,
      plan: "free",
      pending: true
    });

    const priceId = plan === "starter"
      ? process.env.STRIPE_STARTER_PRICE
      : process.env.STRIPE_PRO_PRICE;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `https://app.askra.app/paid-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://app.askra.app/register?plan=${plan}`,
      customer_email: email,
      metadata: { companyId }
    });

    res.json({ success: true, checkout: true, url: session.url });

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
      { companyId: company.companyId, role: company.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, companyId: company.companyId, role: company.role });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// FORGOT PASSWORD
// ===============================
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ error: "Email required" });

    const company = await Company.findOne({ email });

    // Always return success even if email not found (security)
    if (!company)
      return res.json({ success: true });

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await Company.findOneAndUpdate({ email }, {
      passwordResetToken: token,
      passwordResetExpiry: expiry
    });

    await resend.emails.send({
      from: "Askra <noreply@askra.app>",
      to: email,
      subject: "Reset your Askra password",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Reset your password</h2>
          <p>We received a request to reset your Askra password. Click the button below to choose a new one.</p>
          <a href="https://app.askra.app/reset-password?token=${token}" 
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #888; font-size: 13px;">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
        </div>
      `
    });

    res.json({ success: true });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// RESET PASSWORD
// ===============================
app.post("/api/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password)
      return res.status(400).json({ error: "Token and password required" });

    if (password.length < 8)
      return res.status(400).json({ error: "Password must be at least 8 characters" });

    const company = await Company.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() }
    });

    if (!company)
      return res.status(400).json({ error: "Invalid or expired reset link" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await Company.findOneAndUpdate({ _id: company._id }, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiry: null
    });

    res.json({ success: true });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// UPLOAD PDF
// ===============================
app.post("/api/upload-pdf", authenticateToken, upload.single("pdf"), async (req, res) => {
  try {
    const companyId = req.companyId;
const company = await Company.findOne({ companyId });
if (!company)
  return res.status(404).json({ error: "Company not found" });

    if (!req.file)
      return res.status(400).json({ error: "No PDF uploaded" });

// Check PDF limit
const pdfLimits = PLAN_LIMITS[company.plan] || PLAN_LIMITS.free;
const pdfCount = await PdfUpload.countDocuments({ companyId });

if (pdfCount >= pdfLimits.pdfs)
  return res.status(429).json({ error: `You have reached your ${company.plan} plan limit of ${pdfLimits.pdfs} PDF uploads. Please upgrade your plan.` });

    // Step 1: Extract text from PDF
    const pdfParser = new PDFParser();

    const text = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataReady", (pdfData) => {
    const text = pdfData.Pages.map(page =>
  page.Texts.map(t => {
    try {
      return decodeURIComponent(t.R.map(r => r.T).join(""));
    } catch {
      return t.R.map(r => r.T).join("");
    }
  }).join(" ")
).join("\n");
    resolve(text);
  });
  pdfParser.on("pdfParser_dataError", reject);
  pdfParser.parseBuffer(req.file.buffer);
});


if (!text || text.trim().length === 0)
  return res.status(400).json({ error: "Could not extract text from PDF" });

    // Step 2: Split text into chunks
    const chunkSize = 500;
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.slice(i, i + chunkSize).trim();
      if (chunk.length > 0) chunks.push(chunk);
    }

    // Step 3: Get embeddings from OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const index = pinecone.index("jetai-knowledge");
    const uploadId = `${companyId}-${Date.now()}`;

const vectors = [];
for (let i = 0; i < chunks.length; i++) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: chunks[i]
  });

  vectors.push({
    id: `${uploadId}-chunk-${i}`,
    values: embedding.data[0].embedding,
    metadata: { companyId, text: chunks[i], uploadId }
  });
}
// Step 4: Store in Pinecone
    await index.upsert(vectors);

    await PdfUpload.create({
      companyId,
      fileName: req.file.originalname,
      chunkCount: chunks.length,
      uploadId
    });

    res.json({ success: true, chunksStored: chunks.length, fileName: req.file.originalname });

  } catch (err) {
    console.error("PDF Upload Error:", err);
    res.status(500).json({ error: "Failed to process PDF" });
  }
});

// ===============================
// DELETE PDF
// ===============================
app.delete("/api/delete-pdf", authenticateToken, async (req, res) => {
  try {
    const companyId = req.companyId;
    const { uploadId } = req.body;

    if (!uploadId)
      return res.status(400).json({ error: "uploadId required" });

    // Verify this PDF belongs to this company
    const pdfRecord = await PdfUpload.findOne({ uploadId, companyId });
    if (!pdfRecord)
      return res.status(404).json({ error: "PDF not found" });

    // Delete vectors from Pinecone
    const index = pinecone.index("jetai-knowledge");
    const vectorIds = [];
    for (let i = 0; i < pdfRecord.chunkCount; i++) {
      vectorIds.push(`${uploadId}-chunk-${i}`);
    }
    await index.deleteMany(vectorIds);

    // Delete record from MongoDB
    await PdfUpload.deleteOne({ uploadId });

    res.json({ success: true });

  } catch (err) {
    console.error("Delete PDF Error:", err);
    res.status(500).json({ error: "Failed to delete PDF" });
  }
});

// ===============================
// GET PDF LIST
// ===============================
app.get("/api/pdfs", authenticateToken, async (req, res) => {
  try {
    const companyId = req.companyId;

    const pdfs = await PdfUpload.find({ companyId })
      .sort({ createdAt: -1 });

    res.json({ success: true, pdfs });

  } catch (err) {
    console.error("Get PDFs Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// UPDATE COMPANY SETTINGS
// ===============================
app.post("/api/update-settings", authenticateToken, async (req, res) => {
  try {
    const companyId = req.companyId;

    // Fetch company first to check plan
    const company = await Company.findOne({ companyId });
    if (!company) return res.status(404).json({ error: "Company not found" });

    // If free plan, strip locked fields so they can't be changed
    if (company.plan === "free") {
      ["botName", "logoUrl", "openingMessage", "bubbleLogoUrl",
       "primaryColor", "secondaryColor", "accentColor", "textColor",
       "botBubbleColor", "bubbleColor"].forEach(f => delete req.body[f]);
    }

    const {
      botName,
      logoUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      textColor,
      botBubbleColor,
      systemPrompt,
      openingMessage,
      bubbleLogoUrl,
      bubbleColor,
      websiteUrl
    } = req.body;

    const sanitizedBotName = sanitizeHtml(botName || "", { allowedTags: [], allowedAttributes: {} });
    const sanitizedSystemPrompt = sanitizeHtml(systemPrompt || "", { allowedTags: [], allowedAttributes: {} });
    const sanitizedOpeningMessage = sanitizeHtml(openingMessage || "", { allowedTags: [], allowedAttributes: {} });
    const sanitizedLogoUrl = sanitizeHtml(logoUrl || "", { allowedTags: [], allowedAttributes: {} });
    const sanitizedBubbleLogoUrl = sanitizeHtml(bubbleLogoUrl || "", { allowedTags: [], allowedAttributes: {} });

    const updatedCompany = await Company.findOneAndUpdate(
      { companyId },
      {
        ...(company.plan !== "free" && {
          botName: sanitizedBotName,
          logoUrl: sanitizedLogoUrl,
          primaryColor,
          secondaryColor,
          accentColor,
          textColor,
          botBubbleColor,
          openingMessage: sanitizedOpeningMessage,
          bubbleLogoUrl: sanitizedBubbleLogoUrl,
          bubbleColor: bubbleColor || "#7c3aed",
        }),
        systemPrompt: sanitizedSystemPrompt,
        websiteUrl: websiteUrl || "",
      },
      { new: true }
    );

    if (!updatedCompany)
      return res.status(404).json({ error: "Company not found" });

    res.json({
      success: true,
      settings: {
        botName: updatedCompany.botName,
        logoUrl: updatedCompany.logoUrl,
        primaryColor: updatedCompany.primaryColor,
        secondaryColor: updatedCompany.secondaryColor,
        accentColor: updatedCompany.accentColor,
        textColor: updatedCompany.textColor,
        botBubbleColor: updatedCompany.botBubbleColor,
        systemPrompt: updatedCompany.systemPrompt,
        openingMessage: updatedCompany.openingMessage,
        bubbleLogoUrl: updatedCompany.bubbleLogoUrl,
        bubbleColor: updatedCompany.bubbleColor,
        websiteUrl: updatedCompany.websiteUrl
      }
    });

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
      systemPrompt: company.systemPrompt,
      openingMessage: company.openingMessage,
      bubbleLogoUrl: company.bubbleLogoUrl,
      bubbleColor: company.bubbleColor,
      plan: company.plan,
      websiteUrl: company.websiteUrl
    });

  } catch (err) {
    console.error("Get Settings Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// CHAT ENDPOINT
// ===============================
app.post("/chat", chatLimiter, async (req, res) => {
  const { message, userId, companyId } = req.body;

  if (!message || !userId || !companyId)
    return res.status(400).json({ reply: "Missing required fields." });

  if (message.length > 1000)
  return res.status(400).json({ reply: "Message too long. Please keep it under 1000 characters." });

  if (!message.trim())
  return res.status(400).json({ reply: "Message cannot be empty." });

  try {
    const company = await Company.findOne({ companyId });

    if (!company)
      return res.status(400).json({ reply: "Invalid company." });

    if (!company.active)
      return res.status(403).json({ reply: "Subscription inactive." });

    // Check message limit
const limits = PLAN_LIMITS[company.plan] || PLAN_LIMITS.free;
const startOfMonth = new Date();
startOfMonth.setDate(1);
startOfMonth.setHours(0, 0, 0, 0);

const messageCount = await Chat.countDocuments({
  companyId,
  role: "user",
  timestamp: { $gte: startOfMonth }
});

if (messageCount >= limits.messages)
  return res.status(429).json({ reply: `You have reached your ${company.plan} plan limit of ${limits.messages} messages this month. Please upgrade your plan.` });

    // Step 1: Search Pinecone for relevant chunks
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const index = pinecone.index("jetai-knowledge");

    const questionEmbedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message
    });

    const searchResults = await index.query({
      vector: questionEmbedding.data[0].embedding,
      topK: 5,
      filter: { companyId },
      includeMetadata: true
    });

    const relevantChunks = searchResults.matches
      .filter(match => match.score > 0.3)
      .map(match => match.metadata.text)
      .join("\n\n");



    const previousMessages = await Chat.find({ userId, companyId })
      .sort({ timestamp: 1 })
      .limit(10);

    const history = previousMessages.map(msg => ({
      role: msg.role === "bot" ? "assistant" : "user",
      content: msg.message
    }));


    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
      role: "system", 
      content: relevantChunks 
  ? `${company.systemPrompt}\n\nAnswer the question using ONLY the following information. Do not add anything not contained in this text:\n${relevantChunks}` 
  : company.systemPrompt
    },
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
    res.status(500).json({ reply: "Askra is having trouble right now." });
  }
});

// ===============================
// LOAD CHAT HISTORY
// ===============================
app.get("/history", historyLimiter, async (req, res) => {
  const { userId, companyId } = req.query;

  if (!userId || !companyId)
    return res.status(400).json([]);

  try {
    const company = await Company.findOne({ companyId });
    if (!company || !company.active)
      return res.status(403).json([]);

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
// GET COMPANY CONVERSATIONS
// ===============================
app.get("/api/conversations", authenticateToken, async (req, res) => {
  try {
    const companyId = req.companyId;

    // Block free plan
    const company = await Company.findOne({ companyId });
    if (company?.plan === "free") {
      return res.status(403).json({ error: "Upgrade required to view conversations." });
    }

    const messages = await Chat.find({ companyId })
      .sort({ timestamp: 1 });

    // Group messages by userId
    const conversations = {};
    messages.forEach(msg => {
      if (!conversations[msg.userId]) {
        conversations[msg.userId] = [];
      }
      conversations[msg.userId].push({
        role: msg.role,
        message: msg.message,
        timestamp: msg.timestamp
      });
    });

    res.json({ success: true, conversations });

  } catch (err) {
    console.error("Conversations Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// GET USAGE
// ===============================
app.get("/api/usage", authenticateToken, async (req, res) => {
  try {
    const companyId = req.companyId;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const count = await Chat.countDocuments({
      companyId,
      role: "user",
      timestamp: { $gte: startOfMonth }
    });

    res.json({ success: true, monthlyMessages: count });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// ADMIN — GET ALL COMPANIES
// ===============================
app.get("/api/admin/companies", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const companies = await Company.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        const messageCount = await Chat.countDocuments({ companyId: company.companyId });
        const conversationCount = await Chat.distinct("userId", { companyId: company.companyId });
        return {
          ...company.toObject(),
          messageCount,
          conversationCount: conversationCount.length
        };
      })
    );

    res.json({ success: true, companies: companiesWithStats });

  } catch (err) {
    console.error("Admin companies error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// ADMIN — UPDATE COMPANY
// ===============================
app.post("/api/admin/update-company", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { targetCompanyId, active, plan } = req.body;

    if (!targetCompanyId)
      return res.status(400).json({ error: "targetCompanyId required" });

    const updated = await Company.findOneAndUpdate(
      { companyId: targetCompanyId },
      { active, plan },
      { new: true }
    ).select("-password");

    if (!updated)
      return res.status(404).json({ error: "Company not found" });

    res.json({ success: true, company: updated });

  } catch (err) {
    console.error("Admin update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// CREATE CHECKOUT SESSION
// ===============================
app.post("/api/create-checkout", authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body;
    const companyId = req.companyId;

    if (!["starter", "pro"].includes(plan))
      return res.status(400).json({ error: "Invalid plan" });

    const priceId = plan === "starter"
      ? process.env.STRIPE_STARTER_PRICE
      : process.env.STRIPE_PRO_PRICE;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `https://app.askra.app/dashboard?upgraded=true`,
      cancel_url: `https://app.askra.app/dashboard`,
      metadata: { companyId }
    });

    res.json({ success: true, url: session.url });

  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// ===============================
// BILLING PORTAL
// ===============================
app.post("/api/billing-portal", authenticateToken, async (req, res) => {
  try {
    const companyId = req.companyId;
    const company = await Company.findOne({ companyId });

    if (!company || !company.stripeCustomerId)
      return res.status(400).json({ error: "No billing account found" });

    const session = await stripe.billingPortal.sessions.create({
      customer: company.stripeCustomerId,
      return_url: "https://app.askra.app/dashboard",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Billing portal error:", err);
    res.status(500).json({ error: "Failed to open billing portal" });
  }
});

// ===============================
// PAID SUCCESS — exchange session for token
// ===============================
app.get("/api/paid-success", async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id)
      return res.status(400).json({ error: "Missing session_id" });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid")
      return res.status(402).json({ error: "Payment not completed" });

    const companyId = session.metadata.companyId;

    const company = await Company.findOne({ companyId });

    if (!company)
      return res.status(404).json({ error: "Account not found" });

    if (company.pending)
      return res.status(202).json({ error: "Account setup in progress, please try again in a moment" });

    const token = jwt.sign(
      { companyId: company.companyId, role: company.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, companyId: company.companyId, role: company.role });

  } catch (err) {
    console.error("Paid success error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// STRIPE WEBHOOK
// ===============================
app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
  const session = event.data.object;
  const { companyId } = session.metadata;

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  const priceId = lineItems.data[0].price.id;

  let finalPlan = "free";
  if (priceId === process.env.STRIPE_STARTER_PRICE) finalPlan = "starter";
  if (priceId === process.env.STRIPE_PRO_PRICE) finalPlan = "pro";

  const company = await Company.findOne({ companyId });

  if (company && company.pending) {
    // New registration — activate the pending account
    await Company.findOneAndUpdate({ companyId }, {
      plan: finalPlan,
      stripeCustomerId: session.customer,
      pending: false
    });

    await resend.emails.send({
      from: "Askra <noreply@askra.app>",
      to: company.email,
      subject: "Welcome to Askra 🎉",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Welcome to Askra, ${company.name}!</h2>
          <p>Your payment was successful and your account is ready to go.</p>
          <ol>
            <li style="margin-bottom: 8px;">Upload a PDF with information about your business</li>
            <li style="margin-bottom: 8px;">Set your system prompt to describe how your bot should behave</li>
            <li style="margin-bottom: 8px;">Copy your embed code and paste it on your website</li>
          </ol>
          <a href="https://app.askra.app/dashboard" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">Go to Dashboard</a>
          <p style="color: #888; font-size: 13px;">Your Company ID: ${companyId}</p>
        </div>
      `
    });

    console.log(`✅ Account activated and welcome email sent for ${company.email}`);
  } else if (company) {
    // Existing user upgrading plan
    await Company.findOneAndUpdate({ companyId }, {
      plan: finalPlan,
      stripeCustomerId: session.customer
    });
    console.log(`✅ Plan upgraded to ${finalPlan} for ${companyId}`);
  }
}

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const company = await Company.findOne({ stripeCustomerId: subscription.customer });
    if (company) {
      await Company.findOneAndUpdate({ stripeCustomerId: subscription.customer }, { plan: "free" });
      console.log(`⬇️ Plan downgraded to free for ${company.email}`);
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;
    // Only downgrade after 3 failed attempts — gives grace period for temporary card issues
    if (invoice.attempt_count >= 3) {
      const company = await Company.findOne({ stripeCustomerId: invoice.customer });
      if (company) {
        await Company.findOneAndUpdate({ stripeCustomerId: invoice.customer }, { plan: "free" });
        console.log(`⬇️ Payment failed after ${invoice.attempt_count} attempts, plan downgraded to free for ${company.email}`);
      }
    }
  }

  res.json({ received: true });
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});