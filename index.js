const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// === Wichtig für Railway ===
app.set('trust proxy', 1);

// === API-Key als Variable (z. B. in Railway → Variables) ===
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
console.log("OpenRouter Key geladen:", OPENROUTER_API_KEY?.slice(0, 10) + '...');

// === Rate Limiting ===
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Zu viele Anfragen. Bitte warte kurz.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(cors());
app.use(express.json());
app.use(limiter);

// === POST-Endpunkt für KI-Antwort ===
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
      answer: answer,
      emotion: 'ermutigend',
      flirtTip: 'Ein ehrliches Lächeln wirkt Wunder.',
      rawAIResponse: answer
    });

  } catch (error) {
    console.error('Fehler bei der Anfrage:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// === Test-Route ===
app.get('/', (req, res) => {
  res.send('Server läuft!');
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});