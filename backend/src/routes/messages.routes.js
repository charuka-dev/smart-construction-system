import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/:projectId/messages', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, u.name AS sender_name, u.role AS sender_role
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.project_id = ? ORDER BY m.created_at`,
      [req.params.projectId],
    );
    res.json(rows);
  } catch (e) { next(e); }
});

const sendSchema = z.object({ body: z.string().min(1) });

router.post('/:projectId/messages', async (req, res, next) => {
  try {
    const { body } = sendSchema.parse(req.body);
    const [r] = await pool.query(
      'INSERT INTO messages (project_id, sender_id, body) VALUES (?, ?, ?)',
      [req.params.projectId, req.user.id, body],
    );
    res.status(201).json({ id: r.insertId });
  } catch (e) { next(e); }
});

export default router;
