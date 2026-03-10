require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const OpenAI = require("openai");

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());

app.use(
  cors({
    origin: [
      "https://jacksonbot-clean.vercel.app",
      "http://localhost:3000"
    ]
  })
);



// ========================
// MongoDB
// ========================

mongoose.connect(process.env.MONGODB_URI);



// ========================
// Schemas
// ========================

const companySchema = new mongoose.Schema({
  companyId: String,
  name: String,
  botName: String,
  systemPrompt: String,
  openingMessage: String,
  primaryColor: String,
  secondaryColor: String,
  accentColor: String,
  textColor: String,
  botBubbleColor: String,
  active: Boolean
});

const Company = mongoose.model("Company", companySchema);



const chatSchema = new mongoose.Schema({
  userId: String,
  companyId: String,
  role: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.model("Chat", chatSchema);



const pdfChunkSchema = new mongoose.Schema({
  companyId: String,
  chunk: String,
  vector: [Number]
});

const PdfChunk = mongoose.model("PdfChunk", pdfChunkSchema);



// ========================
// Cosine Similarity
// ========================

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);

  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));

  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  return dot / (magA * magB);
}



// ========================
// Multer (memory storage)
// ========================

const upload = multer({ storage: multer.memoryStorage() });



// ========================
// Health check
// ========================

app.get("/", (req, res) => {
  res.send("Backend running");
});



// ========================
// Get company settings
// ========================

app.get("/api/get-settings", async (req, res) => {

  const { companyId } = req.query;

  const company = await Company.findOne({ companyId });

  if (!company) return res.json({});

  res.json(company);
});



// ========================
// Upload PDF
// ========================

app.post("/api/upload-pdf", upload.single("pdf"), async (req, res) => {

  try {

    const { companyId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const pdfData = await pdfParse(req.file.buffer);

    const text = pdfData.text;

    if (!text || text.length < 10) {
      return res.status(400).json({ error: "PDF contains no readable text" });
    }



    // Split text into chunks
    const chunkSize = 500;

    const chunks = [];

    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }



    for (const chunk of chunks) {

      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk
      });

      const vector = embeddingResponse.data[0].embedding;

      await PdfChunk.create({
        companyId,
        chunk,
        vector
      });

    }

    res.json({
      success: true,
      chunksStored: chunks.length
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to process PDF"
    });

  }

});



// ========================
// Chat endpoint
// ========================

app.post("/chat", async (req, res) => {

  try {

    const { message, userId, companyId } = req.body;

    const company = await Company.findOne({ companyId });

    if (!company) {
      return res.json({ reply: "Company not found." });
    }



    // Load history
    const history = await Chat.find({
      userId,
      companyId
    })
      .sort({ timestamp: 1 })
      .limit(10);



    const historyMessages = history.map((msg) => ({
      role: msg.role === "bot" ? "assistant" : "user",
      content: msg.message
    }));



    // Embed user question
    const userEmbeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message
    });

    const userEmbedding = userEmbeddingResponse.data[0].embedding;



    // Get company PDF chunks
    const chunks = await PdfChunk.find({ companyId });



    // Score chunks
    const scored = chunks.map((c) => ({
      text: c.chunk,
      score: cosineSimilarity(userEmbedding, c.vector)
    }));



    scored.sort((a, b) => b.score - a.score);



    const topChunks = scored.slice(0, 5).map((c) => c.text);



    // Build system prompt
    let systemPrompt = company.systemPrompt || "You are a helpful assistant.";

    if (topChunks.length > 0) {

      systemPrompt +=
        "\n\nReference information from company documents:\n" +
        topChunks.join("\n---\n");

    }



    // Chat completion
    const completion = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      messages: [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        { role: "user", content: message }
      ]

    });



    const reply = completion.choices[0].message.content;



    // Save history
    await Chat.create({
      userId,
      companyId,
      role: "user",
      message
    });



    await Chat.create({
      userId,
      companyId,
      role: "bot",
      message: reply
    });



    res.json({ reply });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      reply: "Server error"
    });

  }

});



// ========================
// Chat history
// ========================

app.get("/history", async (req, res) => {

  const { userId, companyId } = req.query;

  const messages = await Chat.find({
    userId,
    companyId
  }).sort({ timestamp: 1 });



  res.json(messages.map((m) => ({
    type: m.role === "bot" ? "bot" : "user",
    text: m.message
  })));

});



// ========================
// Start server
// ========================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});