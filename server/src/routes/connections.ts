import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  try {
    const rows = db.prepare(`
      SELECT c.*, fc.name as from_name, tc.name as to_name
      FROM connections c
      JOIN contacts fc ON c.from_contact_id = fc.id
      JOIN contacts tc ON c.to_contact_id = tc.id
      ORDER BY c.id DESC
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', (req, res) => {
  try {
    const { from_contact_id, to_contact_id, intro_path, status, notes } = req.body;
    const result = db.prepare(`
      INSERT INTO connections (from_contact_id, to_contact_id, intro_path, status, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(from_contact_id, to_contact_id, intro_path || '', status || 'Pending', notes || '');
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { from_contact_id, to_contact_id, intro_path, status, notes } = req.body;
    db.prepare(`
      UPDATE connections SET from_contact_id = ?, to_contact_id = ?, intro_path = ?, status = ?, notes = ?
      WHERE id = ?
    `).run(from_contact_id, to_contact_id, intro_path, status, notes, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM connections WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
