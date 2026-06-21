import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { pool } from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? './uploads');
fs.mkdirSync(path.join(uploadDir, 'progress'), { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(uploadDir, 'progress')),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/:projectId/progress', async (req, res, next) => {
  try {
    const [logs] = await pool.query(
      'SELECT * FROM progress_logs WHERE project_id = ? ORDER BY log_date DESC',
      [req.params.projectId],
    );
    const ids = logs.map((l) => l.id);
    let photos = [];
    if (ids.length) {
      const [rows] = await pool.query(
        `SELECT * FROM progress_photos WHERE log_id IN (${ids.map(() => '?').join(',')})`,
        ids,
      );
      photos = rows;
    }
    const byLog = Object.fromEntries(ids.map((id) => [id, []]));
    for (const p of photos) byLog[p.log_id]?.push(p);
    res.json(logs.map((l) => ({ ...l, photos: byLog[l.id] ?? [] })));
  } catch (e) { next(e); }
});

router.post(
  '/:projectId/progress',
  requireRole('contractor', 'supervisor'),
  upload.array('photos', 10),
  async (req, res, next) => {
    try {
      const { log_date, summary, completion } = req.body;
      const [r] = await pool.query(
        'INSERT INTO progress_logs (project_id, log_date, summary, completion, created_by) VALUES (?, ?, ?, ?, ?)',
        [req.params.projectId, log_date, summary ?? '', Number(completion ?? 0), req.user.id],
      );
      const logId = r.insertId;
      const files = req.files ?? [];
      for (const f of files) {
        const rel = `/uploads/progress/${path.basename(f.path)}`;
        await pool.query('INSERT INTO progress_photos (log_id, file_path) VALUES (?, ?)', [logId, rel]);
      }
      res.status(201).json({ id: logId });
    } catch (e) { next(e); }
  },
);

export default router;
