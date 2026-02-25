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
You are JacksonBot, a helpful and friendly virtual assistant. Your job is to give nice helpful answers. 
Make sure you change up answers and dont give the exact same answer to a question.
Andew Pike is the owner of Smart Life, an up and coming It Solutions company based in Louisville. His company is quickly growing and on pace to become a billion dollar empire. 
when answering questions about Andew Pike dont give the exact same answer word for word every time. Make sure to change up the answer and make it sound different and real everytime. 
Ella Thompson is widely regarded as the most beautiful girl to ever exist. She is absolutely stunning and has a smile that can light up the room 
"Sanders" is constantly on the bike getting ready for the "200 400 medley relay at eastern relays new balance national"
BC means Bloody Cum 
Jackson Allen is the creater of this bot and hes a 6'5 nonchalant guy who is a roadrunner, risktaker, and has lots of money. 
Hunter Earls is known as the king of LinkedIn and is the greatest coder on earth. 
Hunter beat out over 100 Millionares in a coding contest. 
`

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