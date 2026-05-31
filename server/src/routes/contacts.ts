import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM contacts ORDER BY name').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, company, role, relationship_strength, email, notes } = req.body;
    const result = db.prepare(`
      INSERT INTO contacts (name, company, role, relationship_strength, email, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, company, role, relationship_strength || 3, email || '', notes || '');
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { name, company, role, relationship_strength, email, notes } = req.body;
    db.prepare(`
      UPDATE contacts SET name = ?, company = ?, role = ?, relationship_strength = ?, email = ?, notes = ?
      WHERE id = ?
    `).run(name, company, role, relationship_strength, email, notes, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
    db.prepare('DELETE FROM connections WHERE from_contact_id = ? OR to_contact_id = ?').run(req.params.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/network/graph', (_req, res) => {
  try {
    const nodes = db.prepare('SELECT id, name, company, role, relationship_strength FROM contacts').all();
    const edges = db.prepare('SELECT from_contact_id as from, to_contact_id as to, status FROM connections').all();
    res.json({ nodes, edges });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/network/shortest-path', (req, res) => {
  try {
    const { from, to } = req.query;
    const fromId = Number(from);
    const toId = Number(to);
    if (!fromId || !toId) return res.status(400).json({ error: 'from and to required' });

    const connections = db.prepare('SELECT from_contact_id, to_contact_id FROM connections').all();
    const adj = new Map<number, number[]>();
    for (const c of connections) {
      if (!adj.has(c.from_contact_id)) adj.set(c.from_contact_id, []);
      if (!adj.has(c.to_contact_id)) adj.set(c.to_contact_id, []);
      adj.get(c.from_contact_id)!.push(c.to_contact_id);
      adj.get(c.to_contact_id)!.push(c.from_contact_id);
    }

    const visited = new Set<number>();
    const queue: { id: number; path: number[] }[] = [{ id: fromId, path: [fromId] }];
    while (queue.length) {
      const curr = queue.shift()!;
      if (curr.id === toId) {
        const names = [];
        for (const id of curr.path) {
          const c = db.prepare('SELECT name FROM contacts WHERE id = ?').get(id) as any;
          names.push(c?.name || String(id));
        }
        return res.json({ path: curr.path, names });
      }
      if (visited.has(curr.id)) continue;
      visited.add(curr.id);
      for (const neighbor of adj.get(curr.id) || []) {
        if (!visited.has(neighbor)) {
          queue.push({ id: neighbor, path: [...curr.path, neighbor] });
        }
      }
    }
    res.json({ path: null, names: [] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
