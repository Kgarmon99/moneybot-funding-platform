import { Router } from 'express';
import { db } from '../db.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const router = Router();
const uploadDir = path.join(process.cwd(), 'data', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});
const upload = multer({ storage });

router.get('/', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM documents ORDER BY folder, name').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { folder } = req.body;
    const shareableLink = `share-${uuidv4().slice(0, 8)}`;
    const password = Math.random().toString(36).slice(2, 8);
    const result = db.prepare(`
      INSERT INTO documents (name, folder, file_path, file_size, shareable_link, password)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.file.originalname, folder || 'Uncategorized', req.file.path, req.file.size, shareableLink, password);
    res.status(201).json({ id: result.lastInsertRowid, shareableLink, password });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id/folder', (req, res) => {
  try {
    const { folder } = req.body;
    db.prepare('UPDATE documents SET folder = ? WHERE id = ?').run(folder, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const doc = db.prepare('SELECT file_path FROM documents WHERE id = ?').get(req.params.id) as any;
    if (doc?.file_path && fs.existsSync(doc.file_path)) {
      fs.unlinkSync(doc.file_path);
    }
    db.prepare('DELETE FROM document_views WHERE document_id = ?').run(req.params.id);
    db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/share/:link', (req, res) => {
  try {
    const doc = db.prepare('SELECT * FROM documents WHERE shareable_link = ?').get(req.params.link) as any;
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ id: doc.id, name: doc.name, folder: doc.folder, requiresPassword: !!doc.password });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/share/:link/view', (req, res) => {
  try {
    const { password, viewerEmail, ipAddress } = req.body;
    const doc = db.prepare('SELECT * FROM documents WHERE shareable_link = ?').get(req.params.link) as any;
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.password && doc.password !== password) return res.status(401).json({ error: 'Invalid password' });

    db.prepare(`
      INSERT INTO document_views (document_id, viewer_email, ip_address)
      VALUES (?, ?, ?)
    `).run(doc.id, viewerEmail || null, ipAddress || null);

    res.json({ success: true, filePath: doc.file_path });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/:id/views', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM document_views WHERE document_id = ? ORDER BY viewed_at DESC').all(req.params.id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
