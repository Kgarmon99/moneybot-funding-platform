import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  try {
    const row = db.prepare('SELECT * FROM startup_profile LIMIT 1').get();
    res.json(row || null);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/', (req, res) => {
  try {
    const { name, stage, sector, location, founded_year, team_size, revenue, description } = req.body;
    const existing = db.prepare('SELECT id FROM startup_profile LIMIT 1').get() as any;
    if (existing) {
      db.prepare(`
        UPDATE startup_profile SET name = ?, stage = ?, sector = ?, location = ?, founded_year = ?, team_size = ?, revenue = ?, description = ?
        WHERE id = ?
      `).run(name, stage, sector, location, founded_year, team_size, revenue, description, existing.id);
      res.json({ id: existing.id });
    } else {
      const result = db.prepare(`
        INSERT INTO startup_profile (name, stage, sector, location, founded_year, team_size, revenue, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(name, stage, sector, location, founded_year, team_size, revenue, description);
      res.status(201).json({ id: result.lastInsertRowid });
    }
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
