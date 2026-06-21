import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/:projectId/milestones', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date',
      [req.params.projectId],
    );
    res.json(rows);
  } catch (e) { next(e); }
});

const createSchema = z.object({
  title: z.string().min(1),
  due_date: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  progress: z.number().min(0).max(100).default(0),
});

router.post('/:projectId/milestones', requireRole('contractor', 'supervisor'), async (req, res, next) => {
  try {
    const d = createSchema.parse(req.body);
    const [r] = await pool.query(
      'INSERT INTO milestones (project_id, title, due_date, status, progress) VALUES (?, ?, ?, ?, ?)',
      [req.params.projectId, d.title, d.due_date, d.status, d.progress],
    );
    res.status(201).json({ id: r.insertId, project_id: Number(req.params.projectId), ...d });
  } catch (e) { next(e); }
});

router.patch('/:projectId/milestones/:id', requireRole('contractor', 'supervisor'), async (req, res, next) => {
  try {
    const { title, due_date, status, progress } = req.body;
    await pool.query(
      `UPDATE milestones SET
        title = COALESCE(?, title),
        due_date = COALESCE(?, due_date),
        status = COALESCE(?, status),
        progress = COALESCE(?, progress)
       WHERE id = ? AND project_id = ?`,
      [title ?? null, due_date ?? null, status ?? null, progress ?? null, req.params.id, req.params.projectId],
    );
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
