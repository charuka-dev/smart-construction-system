import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { pool } from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { runBlueprintPipeline } from '../services/cv.service.js';

const router = Router();
router.use(requireAuth);

const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? './uploads');
fs.mkdirSync(path.join(uploadDir, 'blueprints'), { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(uploadDir, 'blueprints')),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

router.get('/:projectId/model', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM models WHERE project_id = ? ORDER BY id DESC LIMIT 1',
      [req.params.projectId],
    );
    if (!rows[0]) return res.json({ rooms: [] });
    res.json({ id: rows[0].id, ...JSON.parse(rows[0].rooms_json) });
  } catch (e) { next(e); }
});

router.post(
  '/:projectId/blueprint',
  requireRole('contractor', 'supervisor'),
  upload.single('blueprint'),
  async (req, res, next) => {
    try {
      if (!req.file) return next({ status: 400, message: 'No blueprint file uploaded' });
      const rel = `/uploads/blueprints/${path.basename(req.file.path)}`;
      const [bpInsert] = await pool.query(
        'INSERT INTO blueprints (project_id, file_path) VALUES (?, ?)',
        [req.params.projectId, rel],
      );

      // Synchronous call-and-wait subprocess (per spec)
      const model = await runBlueprintPipeline(req.file.path);

      const [modelInsert] = await pool.query(
        'INSERT INTO models (project_id, rooms_json, source_blueprint_id) VALUES (?, ?, ?)',
        [req.params.projectId, JSON.stringify(model), bpInsert.insertId],
      );

      res.status(201).json({
        blueprint_id: bpInsert.insertId,
        model_id: modelInsert.insertId,
        ...model,
      });
    } catch (e) { next(e); }
  },
);

export default router;
