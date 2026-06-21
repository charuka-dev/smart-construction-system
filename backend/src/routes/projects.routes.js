import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// List projects visible to current user
router.get('/', async (req, res, next) => {
  try {
    const { id, role } = req.user;
    let sql = 'SELECT * FROM projects';
    const params = [];
    if (role === 'client') { sql += ' WHERE client_id = ?'; params.push(id); }
    else if (role === 'supervisor') { sql += ' WHERE supervisor_id = ?'; params.push(id); }
    else if (role === 'contractor') { sql += ' WHERE contractor_id = ?'; params.push(id); }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!rows[0]) return next({ status: 404, message: 'Not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

const createSchema = z.object({
  name: z.string().min(1),
  client_id: z.number().int(),
  supervisor_id: z.number().int().nullable().optional(),
  budget: z.number().nonnegative().default(0),
  status: z.enum(['planning', 'in_progress', 'on_hold', 'completed']).default('planning'),
});

router.post('/', requireRole('contractor'), async (req, res, next) => {
  try {
    const d = createSchema.parse(req.body);
    const [r] = await pool.query(
      `INSERT INTO projects (name, client_id, contractor_id, supervisor_id, budget, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [d.name, d.client_id, req.user.id, d.supervisor_id ?? null, d.budget, d.status],
    );
    res.status(201).json({ id: r.insertId, ...d, contractor_id: req.user.id });
  } catch (e) { next(e); }
});

router.patch('/:id', requireRole('contractor'), async (req, res, next) => {
  try {
    const { name, supervisor_id, budget, status } = req.body;
    await pool.query(
      `UPDATE projects SET
        name = COALESCE(?, name),
        supervisor_id = COALESCE(?, supervisor_id),
        budget = COALESCE(?, budget),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [name ?? null, supervisor_id ?? null, budget ?? null, status ?? null, req.params.id],
    );
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.delete('/:id', requireRole('contractor'), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
