import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(['contractor', 'supervisor', 'client']),
});

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const password_hash = await hashPassword(data.password);
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [data.email, password_hash, data.name, data.role],
    );
    const user = { id: result.insertId, email: data.email, name: data.name, role: data.role };
    const token = signToken({ id: user.id, role: user.role });
    res.status(201).json({ user, token });
  } catch (e) { next(e); }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const u = rows[0];
    if (!u || !(await comparePassword(password, u.password_hash))) {
      return next({ status: 401, message: 'Invalid credentials' });
    }
    const user = { id: u.id, email: u.email, name: u.name, role: u.role };
    const token = signToken({ id: user.id, role: user.role });
    res.json({ user, token });
  } catch (e) { next(e); }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [req.user.id],
    );
    if (!rows[0]) return next({ status: 404, message: 'User not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

export default router;
