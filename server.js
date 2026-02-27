const express = require("express");
const cors = require("cors");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config(); // Load API key from .env

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// System prompt
const systemPrompt = `
You are JacksonBot, a helpful and friendly virtual assistant...
`;

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
    });
    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.json({ reply: "PlumberBot is having trouble right now." });
  }
});

// Serve React build folder
const buildPath = path.join(__dirname, "plumberbot-frontend", "build");
app.use(express.static(buildPath));

// --- Catch-all for React routes ---
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});