require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai").default;

const app = express();

// IMPORTANT: Explicit CORS config
app.use(cors({
  origin: "https://jacksonbot-clean.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

// This fixes Express 5 preflight issue
app.options("/chat", cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Jet backend running");
});

app.post("/chat", async (req, res) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Jet, a helpful AI assistant." },
        { role: "user", content: req.body.message },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });

  } catch (err) {
    console.error("OpenAI Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});