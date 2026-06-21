import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/:projectId/expenses', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM expenses WHERE project_id = ? ORDER BY incurred_at DESC',
      [req.params.projectId],
    );
    const [[totals]] = await pool.query(
      'SELECT COALESCE(SUM(amount),0) AS total FROM expenses WHERE project_id = ?',
      [req.params.projectId],
    );
    res.json({ items: rows, total: Number(totals.total) });
  } catch (e) { next(e); }
});

const createSchema = z.object({
  category: z.string().min(1),
  description: z.string().default(''),
  amount: z.number().nonnegative(),
  incurred_at: z.string(),
});

router.post('/:projectId/expenses', requireRole('contractor', 'supervisor'), async (req, res, next) => {
  try {
    const d = createSchema.parse(req.body);
    const [r] = await pool.query(
      'INSERT INTO expenses (project_id, category, description, amount, incurred_at, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.projectId, d.category, d.description, d.amount, d.incurred_at, req.user.id],
    );
    res.status(201).json({ id: r.insertId, project_id: Number(req.params.projectId), ...d, created_by: req.user.id });
  } catch (e) { next(e); }
});

export default router;
