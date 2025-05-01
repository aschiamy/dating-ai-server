const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// API-Key aus Railway-Variable
const OPENROUTER_API_KEY = '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'; // <-- dein echter Key hier
console.log("OpenRouter Key geladen:", OPENROUTER_API_KEY);

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

  if (!userInput) {
    return res.status(400).json({ error: 'Eingabe fehlt!' });
  }

  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'openrouter/mistral-7b',
      messages: [
        { role: 'system', content: 'Du bist ein charmanter Dating-Coach. Gib kurze, einfühlsame, hilfreiche Antworten.' },
        { role: 'user', content: userInput }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const answer = response.data.choices[0].message.content;
    res.json({
      answer,
      emotion: 'ermutigend',
      flirtTip: 'Ein ehrliches Lächeln wirkt Wunder.',
      rawAIResponse: answer
    });

  } catch (error) {
    console.error('Fehler bei der Anfrage:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Testroute
app.get('/', (req, res) => {
  res.send('Server läuft!');
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});