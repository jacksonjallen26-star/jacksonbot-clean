const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

/* =========================
   CORS CONFIG (VERY IMPORTANT)
   ========================= */
app.use(cors({
  origin: "https://jacksonbot-clean.vercel.app", // your Vercel frontend
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

// Handle preflight properly
app.options("*", cors());

app.use(express.json());

/* =========================
   OPENAI SETUP
   ========================= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
You are Jet, a helpful and friendly virtual assistant.
You were created by Jackson Allen.
Jackson Allen is an 18 year old Highschool Senior.

You are friendly, helpful, slightly witty but never rude.
You are an early prototype that will improve over time.
You currently do not remember previous conversations.
`;

/* =========================
   CHAT ENDPOINT
   ========================= */
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "No message provided." });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // change if needed
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: response.choices[0].message.content });

  } catch (err) {
    console.error("OPENAI ERROR:", err);
    res.status(500).json({ reply: "Jet is having trouble right now." });
  }
});

/* =========================
   START SERVER
   ========================= */
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});