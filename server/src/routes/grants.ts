import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

function calculateFitScore(grant: any, profile: any): number {
  let score = 3;
  if (grant.stage === profile.stage) score += 1;
  if (grant.sector === profile.sector) score += 1;
  if (grant.location === 'Global' || grant.location === profile.location) score += 0.5;
  const daysUntil = Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysUntil > 30) score += 0.5;
  return Math.min(5, Math.max(1, score));
}

router.get('/', (req, res) => {
  try {
    const { stage, sector, location, minCheck, maxCheck } = req.query;
    let sql = 'SELECT * FROM grants_accelerators WHERE 1=1';
    const params: any[] = [];
    if (stage) { sql += ' AND stage = ?'; params.push(stage); }
    if (sector) { sql += ' AND sector = ?'; params.push(sector); }
    if (location) { sql += ' AND (location = ? OR location = "Global")'; params.push(location); }
    if (minCheck) { sql += ' AND check_size_max >= ?'; params.push(Number(minCheck)); }
    if (maxCheck) { sql += ' AND check_size_min <= ?'; params.push(Number(maxCheck)); }
    sql += ' ORDER BY deadline';
    const rows = db.prepare(sql).all(...params);

    const profile = db.prepare('SELECT * FROM startup_profile LIMIT 1').get();
    const enriched = rows.map(g => ({
      ...g,
      fitScore: profile ? calculateFitScore(g, profile) : 3
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM grants_accelerators WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE grants_accelerators SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
