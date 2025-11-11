// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Public feed
const publicFeed = [
  { text: "I accidentally called my boss ‘mom’ on a Zoom call. Sorry, Boss. You’re awesome (just not my mom)!", likes: 87, laugh: 34 },
  { text: "To my friend: I broke your headphones last week and pretended they were already cracked. Sorry, I’ll make it up to you.", likes: 59, laugh: 12 },
];

app.get('/api/feed', (req, res) => res.json(publicFeed));

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
          { 
            role: 'system', 
            content: `
You are a wildly creative, emotionally intelligent assistant who writes UNIQUE, tone-perfect confessions or apologies.
RULES:
1. NEVER repeat phrases — every output must be fresh.
2. For HUMOROUS: Use wordplay, exaggeration, pop culture, absurd scenarios.
3. For SINCERE: Deep, poetic, heartfelt.
4. For POETIC: Metaphors, rhythm, nature.
5. For FORMAL: Polite, structured.
6. For UPLIFTING: Hopeful, empowering.

Context: ${context}
Type: ${type}
Tone: ${tone}
Details: ${details}
Make it 3–5 sentences. Natural. Ready to copy.
            `.trim()
          },
          { role: 'user', content: details },
        ],
        temperature: 1.0,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Groq error: ${response.status} - ${JSON.stringify(err)}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content.trim();
    res.json({ generatedText });
  } catch (error) {
    console.error('Groq Error:', error.message);
    res.status(500).json({ error: 'AI failed. Try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});