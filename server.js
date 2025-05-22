const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(cors());
app.use(bodyParser.json());

app.post('/generate-commit', async (req, res) => {
  const diff = req.body.diff;
  if (!diff) {
    return res.status(400).json({ error: 'Missing diff' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: `Genera un mensaje de commit con tipo (feat:, fix:, docs:, etc.) para este diff:\n${diff}`,
          },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const commitMsg = response.data.choices[0].message.content;
    res.json({ message: commitMsg });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Error contacting OpenAI' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
