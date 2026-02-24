// server.js - Complete PlumberBot backend

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config(); // Loads your API key from .env

// Initialize Express
const app = express();
app.use(express.static(__dirname));
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// System prompt with company info
const systemPrompt = `
Jimmy Allen also know as "Jimmy get money Allen" is a leading Service Sales Consultant at World Wide Technology. He regularly closes million dollar deals and is on pace to be the next Jim Kavanaugh, although his son Jackson Allen is quickly outperforming him. 
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

    const reply = response.choices[0].message.content;
    res.json({ reply });

  } catch (err) {
    console.error("OpenAI API error:", err.message);
    res.json({ reply: "Sorry, PlumberBot is having trouble right now." });
  }
});

// Start server
const PORT = process.env.PORT || 3000;  // Use Render's port if available
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});