import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';

const SELF_REGISTRATION_ROLES = ['CITIZEN', 'VENDOR'];

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone_number } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const normalizedRole = String(role).toUpperCase();
    if (!SELF_REGISTRATION_ROLES.includes(normalizedRole)) {
      res.status(403).json({ message: 'Only consumer and vendor accounts can be created through public registration.' });
      return;
    }

    if (String(password).length < 8) {
      res.status(400).json({ message: 'Password must contain at least 8 characters.' });
      return;
    }

    const [existing]: any[] = await pool.execute('SELECT id FROM users WHERE email = ?', [String(email).trim().toLowerCase()]);
    if (existing.length > 0) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const isActive = normalizedRole === 'CITIZEN' ? 1 : 0;

    const [roleRows]: any[] = await pool.execute('SELECT id FROM roles WHERE name = ? LIMIT 1', [normalizedRole]);
    if (!roleRows.length) { res.status(500).json({ message: 'Requested account role is not configured.' }); return; }

    await pool.execute(
      'INSERT INTO users (id, role_id, full_name, email, password_hash, role, phone_number, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, roleRows[0].id, String(name).trim(), String(email).trim().toLowerCase(), hashedPassword, normalizedRole, phone_number || null, isActive]
    );

    res.status(201).json({
      message: normalizedRole === 'VENDOR'
        ? 'Vendor application submitted. Your account requires government verification before activation.'
        : 'Consumer account registered successfully.',
      status: normalizedRole === 'VENDOR' ? 'PENDING_VERIFICATION' : 'ACTIVE'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const [rows]: any[] = await pool.execute('SELECT * FROM users WHERE email = ?', [String(email).trim().toLowerCase()]);
    if (rows.length === 0) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const user = rows[0];
    if (!user.is_active) {
      res.status(403).json({ message: 'This account is pending approval or has been disabled.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: 'Server authentication configuration is incomplete.' });
      return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as jwt.SignOptions);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.full_name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const [rows]: any[] = await pool.execute(
      'SELECT id, full_name, email, role, phone_number, is_active, is_verified FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Current user error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
