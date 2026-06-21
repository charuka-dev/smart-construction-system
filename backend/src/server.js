import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import milestonesRoutes from './routes/milestones.routes.js';
import expensesRoutes from './routes/expenses.routes.js';
import progressRoutes from './routes/progress.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import modelRoutes from './routes/model.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));
app.use(express.json({ limit: '10mb' }));

const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? './uploads');
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/projects', milestonesRoutes);
app.use('/api/projects', expensesRoutes);
app.use('/api/projects', progressRoutes);
app.use('/api/projects', messagesRoutes);
app.use('/api/projects', modelRoutes);

// Error handler
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  const status = err.status ?? 500;
  res.status(status).json({ error: err.message ?? 'Internal error' });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`BuildSync-3D API listening on http://localhost:${port}`);
});
