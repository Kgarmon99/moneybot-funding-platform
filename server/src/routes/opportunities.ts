import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM opportunities ORDER BY deadline').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM opportunities WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', (req, res) => {
  try {
    const { source_name, amount, deadline, stage, last_action, next_action, notes } = req.body;
    const result = db.prepare(`
      INSERT INTO opportunities (source_name, amount, deadline, stage, last_action, next_action, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(source_name, amount, deadline, stage || 'Lead', last_action || '', next_action || '', notes || '');
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { source_name, amount, deadline, stage, last_action, next_action, notes } = req.body;
    db.prepare(`
      UPDATE opportunities SET source_name = ?, amount = ?, deadline = ?, stage = ?, last_action = ?, next_action = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(source_name, amount, deadline, stage, last_action, next_action, notes, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM opportunities WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
