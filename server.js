require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

// ✅ Middleware
app.use(express.json());

// ✅ CORS (IMPORTANT for Vercel frontend)
app.use(cors({
  origin: [
    "https://jacksonbot-clean.vercel.app",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

// ✅ Express 5 preflight fix
app.options("/*", cors());

// ✅ OpenAI Setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Health check (important for Railway)
app.get("/", (req, res) => {
  res.json({ status: "Jet backend running 🚀" });
});

// ✅ Chat Endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Jet, a helpful AI assistant." },
        { role: "user", content: message }
      ],
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Railway PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});