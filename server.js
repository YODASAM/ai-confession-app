import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
if (!GROQ_API_KEY) {
  console.error("GROQ_API_KEY missing!");
}

app.post('/api/generate-confession', async (req, res) => {
  const { type, context, details, tone } = req.body;
  if (!type || !context || !details || !tone) {
    return res.status(400).json({ error: 'All fields required.' });
  }

  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a warm, creative assistant...' },
          { role: 'user', content: details },
        ],
        temperature: 1.0,
        max_tokens: 200,
      }),
    });

    if (!response.ok) throw new Error('Groq API failed');

    const data = await response.json();
    res.json({ generatedText: data.choices[0].message.content.trim() });
  } catch (error) {
    res.status(500).json({ error: 'AI failed. Check key.' });
  }
});

export default app;
