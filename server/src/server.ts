import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';
import { initSchema } from './db.js';
import { seedData } from './seed.js';
import opportunitiesRouter from './routes/opportunities.js';
import grantsRouter from './routes/grants.js';
import contactsRouter from './routes/contacts.js';
import connectionsRouter from './routes/connections.js';
import documentsRouter from './routes/documents.js';
import profileRouter from './routes/profile.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

mkdirSync(path.join(__dirname, '../data'), { recursive: true });
initSchema();
seedData();

app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/grants', grantsRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/connections', connectionsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/profile', profileRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
