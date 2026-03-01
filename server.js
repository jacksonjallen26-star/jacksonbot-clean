const express = require("express");
const cors = require("cors");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

/* =========================
   CORS - allow only your frontend
========================= */
app.use(cors({
  origin: "https://jacksonbot-clean.vercel.app", // <-- your Vercel frontend URL
}));

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
    if (!message) return res.status(400).json({ reply: "No message provided." });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
            You are Jet, a helpful and friendly virtual assistant.
            Sound human but never rude.
          `
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    res.json({ reply: response.choices[0].message.content });

  } catch (err) {
    console.error("OpenAI Error:", err);
    res.status(500).json({ reply: "Jet is having trouble right now." });
  }
});

/* =========================
   SERVE REACT FRONTEND (optional)
========================= */
const frontendPath = path.join(__dirname, "plumberbot-frontend", "build");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});