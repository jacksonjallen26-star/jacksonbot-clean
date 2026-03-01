const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

/* =========================
   CORS (TEMP: allow all)
   ========================= */
app.use(cors()); 
// After everything works, we can restrict to your Vercel domain

app.use(express.json());

/* =========================
   HEALTH CHECK
   ========================= */
app.get("/", (req, res) => {
  res.send("Backend is alive");
});

/* =========================
   OPENAI SETUP
   ========================= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================
   CHAT ENDPOINT
   ========================= */
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "No message provided." });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are Jet, a helpful and friendly AI assistant."
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    res.json({
      reply: response.choices[0].message.content
    });

  } catch (err) {
    console.error("OpenAI Error:", err);
    res.status(500).json({
      reply: "Jet is having trouble right now."
    });
  }
});

/* =========================
   START SERVER
   ========================= */
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});