const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve React build in production
const PUBLIC = path.join(__dirname, 'public');
app.use(express.static(PUBLIC));

// POST /api/predictions — save (upsert) by name
app.post('/api/predictions', (req, res) => {
  const { name, predictions } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'A valid name is required' });
  }
  if (!predictions || typeof predictions !== 'object') {
    return res.status(400).json({ error: 'Predictions data is required' });
  }

  const trimmedName = name.trim();

  try {
    const existing = db.prepare('SELECT id FROM predictions WHERE name = ?').get(trimmedName);

    if (existing) {
      db.prepare(
        'UPDATE predictions SET predictions_json = ?, updated_at = CURRENT_TIMESTAMP WHERE name = ?'
      ).run(JSON.stringify(predictions), trimmedName);
    } else {
      db.prepare(
        'INSERT INTO predictions (name, predictions_json) VALUES (?, ?)'
      ).run(trimmedName, JSON.stringify(predictions));
    }

    res.json({ success: true, message: 'Predictions saved!' });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ error: 'Failed to save predictions' });
  }
});

// GET /api/predictions — list all users
app.get('/api/predictions', (req, res) => {
  try {
    const users = db
      .prepare('SELECT name, created_at, updated_at FROM predictions ORDER BY updated_at DESC')
      .all();
    res.json(users);
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// GET /api/predictions/:name — get one user's predictions
app.get('/api/predictions/:name', (req, res) => {
  const { name } = req.params;

  try {
    const row = db.prepare('SELECT * FROM predictions WHERE name = ?').get(name);

    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      name: row.name,
      predictions: JSON.parse(row.predictions_json),
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// Fall through to React for any non-API route (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🏆 WC2026 Predictions running on http://localhost:${PORT}\n`);
});
