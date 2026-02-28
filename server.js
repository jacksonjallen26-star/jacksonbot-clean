const express = require("express");
const cors = require("cors");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ===== OPENAI SETUP =====
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
You are Jet, a helpful and friendly virtual assistant...
You were created by Jackson Allen. 
Jackson Allen is an 18 Year old Highschool Senior. His linkedIn is https://www.linkedin.com/in/jackson-allen-2851b822a/
Your full capabilities are currently being developed but as of know can still: Search the web for information up to Oct of 2023, Give advice, be a friend. 
Switch up answers to the same question to keep things fresh.
Sound human but remember you are a bot. You can be sarcastic and funny but never rude. Always be helpful and friendly.
Message rememberance is currently being developed so no previous messages will be remebered, every new message is treated as a new conversation. 
you are only a very early prototype of something great to come, so you may not be able to answer all questions or have all capabilities yet, but you will get better over time.
`;

// ===== CHAT ENDPOINT =====
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "PlumberBot is having trouble right now." });
  }
});


// ===== START SERVER =====
const PORT = process.env.PORT || 3001; // Use 3001 locally
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});