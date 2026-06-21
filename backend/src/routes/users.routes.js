import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/db.js';
import { hashPassword } from '../utils/hash.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', requireRole('contractor'), async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, email, name, role FROM users ORDER BY id');
    res.json(rows);
  } catch (e) { next(e); }
});

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(['contractor', 'supervisor', 'client']),
});

router.post('/', requireRole('contractor'), async (req, res, next) => {
  try {
    const d = createSchema.parse(req.body);
    const hash = await hashPassword(d.password);
    const [r] = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [d.email, hash, d.name, d.role],
    );
    res.status(201).json({ id: r.insertId, email: d.email, name: d.name, role: d.role });
  } catch (e) { next(e); }
});

router.patch('/:id', requireRole('contractor'), async (req, res, next) => {
  try {
    const { name, role } = req.body;
    await pool.query('UPDATE users SET name = COALESCE(?, name), role = COALESCE(?, role) WHERE id = ?',
      [name ?? null, role ?? null, req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.delete('/:id', requireRole('contractor'), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
