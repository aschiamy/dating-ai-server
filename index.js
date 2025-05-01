const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true); // Für Railway notwendig

// API-Key aus Umgebungsvariablen
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  console.error('FEHLER: Kein OpenRouter API-Key gefunden.');
} else {
  console.log('OpenRouter Key geladen:', OPENROUTER_API_KEY.slice(0, 8) + '...');
}

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Zu viele Anfragen. Bitte warte kurz.' }
});

app.use(cors());
app.use(express.json());
app.use(limiter);

// POST-Endpunkt für Chat
app.post('/generateResponse', async (req, res) => {
  const { userInput } = req.body;

  console.log('POST /generateResponse empfangen');
  console.log('User Input:', userInput);

  if (!userInput) {
    console.warn('Warnung: Keine Eingabe erhalten.');
    return res.status(400).json({ error: 'Eingabe fehlt!' });
  }

  try {
    console.log('Sende Anfrage an OpenRouter...');

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/mistral-7b',
        messages: [
          { role: 'system', content: 'Du bist ein charmanter Dating-Coach. Gib kurze, einfühlsame Antworten.' },
          { role: 'user', content: userInput }
        ]
      },
      {
        headers: {
  'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://chat.openai.com'
}
      }
    );

    console.log('Antwort erhalten von OpenRouter');
    const answer = response.data.choices[0].message.content;
    res.json({
      answer: answer,
      emotion: 'ermutigend',
      flirtTip: 'Ein ehrliches Lächeln wirkt Wunder.',
      rawAIResponse: answer
    });

  } catch (error) {
    console.error('Fehler bei der Anfrage an OpenRouter:');
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// GET-Test-Route
app.get('/', (req, res) => {
  res.send('Server läuft!');
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
