const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// OpenRouter API-Key aus Umgebungsvariable
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
console.log('OpenRouter Key geladen:', OPENROUTER_API_KEY);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Zu viele Anfragen. Bitte warte kurz.' }
});

app.set('trust proxy', true); // Wichtig für Railway + Rate-Limiting
app.use(cors());
app.use(express.json());
app.use(limiter);

// POST-Endpunkt für Chat

app.post("/generateResponse", async (req, res) => {
  const { userInput } = req.body;

  if (!userInput) {
    return res.status(400).json({ error: 'Eingabe fehlt!' });
  }

  console.log('POST /generateResponse empfangen');
  console.log('User Input:', userInput);
  console.log('Sende Anfrage an OpenRouter...');

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
      model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein charmanter Dating-Coach. Gib kurze, einfühlsame, hilfreiche Antworten.'
          },
          {
            role: 'user',
            content: userInput
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://chat.openai.com' // <- Wichtig!
        }
      }
    );

    const answer = response.data.choices[0].message.content;

    res.json({
      answer,
      emotion: 'ermutigend',
      flirtTip: 'Ein ehrliches Lächeln wirkt Wunder.',
      rawAIResponse: answer
    });

  } catch (error) {
    console.error('Fehler bei der Anfrage an OpenRouter:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Test-Endpunkt für Browser
app.get('/', (req, res) => {
  res.send('Server läuft!');
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});