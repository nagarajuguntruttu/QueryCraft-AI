const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const QueryHistory = require('../models/QueryHistory');

// Protected: Generate Query
router.post('/generate', auth, async (req, res) => {
  const { prompt, dbType } = req.body;

  if (!prompt || !dbType) {
    return res.status(400).json({ error: 'Prompt and dbType are required.' });
  }

  const systemInstruction = dbType === 'mongodb' 
    ? 'You are an expert MongoDB DBA. Translate natural language requests into production-ready Mongoose / MongoDB queries or aggregation pipelines. Return ONLY a valid JSON object with keys: "query" and "explanation".'
    : 'You are an expert SQL DBA. Translate natural language requests into optimized ANSI SQL queries. Return ONLY a valid JSON object with keys: "query" and "explanation".';

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5173', // Optional
          'X-Title': 'QueryCraft',           // Optional
          'Content-Type': 'application/json'
        }
      }
    );

    const rawContent = response.data.choices[0].message.content;
    let parsedData;
    try {
      const cleanJson = rawContent.replace(/```json|```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    } catch (e) {
      parsedData = { query: rawContent, explanation: 'Direct response from model.' };
    }

    // --- SAFEGUARD ADDED ON TOP ---
    // If parsedData.query is an object/JSON, convert it to a formatted string 
    // so Mongoose doesn't throw a validation CastError.
    const finalQueryString = typeof parsedData.query === 'object' 
      ? JSON.stringify(parsedData.query, null, 2) 
      : String(parsedData.query);

    const newHistory = new QueryHistory({
      userId: req.user,
      prompt,
      dbType,
      generatedQuery: finalQueryString, // Using the safe string version here
      explanation: parsedData.explanation || 'No explanation provided.'
    });
    await newHistory.save();

    res.json({ success: true, data: newHistory });
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate query' });
  }
});

// Protected: Fetch User Search History
router.get('/history', auth, async (req, res) => {
  try {
    const history = await QueryHistory.find({ userId: req.user }).sort({ createdAt: -1 }).limit(10);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching personal history' });
  }
});

module.exports = router;