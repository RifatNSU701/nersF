import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database'; 

// Define valid roles locally to avoid import errors
const VALID_ROLES = ['ADMIN', 'CITIZEN', 'VENDOR', 'OFFICER'];

// ==========================================
// REGISTER
// ==========================================
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone_number } = req.body;

    // 1. Validate Input
    if (!name || !email || !password || !role) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // 2. Validate Role
    // We convert input to uppercase to match our database ENUM
    const normalizedRole = role.toUpperCase();
    if (!VALID_ROLES.includes(normalizedRole)) {
      res.status(400).json({ message: 'Invalid Role provided' });
      return;
    }

    // 3. Check for Existing User
    const [existing]: any[] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    // 4. Hash Password & ID
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // 5. Insert into DB
    await pool.execute(
      `INSERT INTO users (id, full_name, email, password_hash, role, phone_number, is_active) 
        VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [userId, name, email, hashedPassword, normalizedRole, phone_number]
    );

    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ==========================================
// LOGIN
// ==========================================
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Find User
    const [rows]: any[] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const user = rows[0];

    // 2. Check Password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // 3. Generate Token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role // This is a string (e.g. "VENDOR")
      }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      message: 'Login successful', 
      token,
      user: {
        id: user.id,
        name: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ==========================================
// GET CURRENT USER
// ==========================================
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
       res.status(401).json({ message: "Unauthorized" });
       return;
    }

    const [rows]: any[] = await pool.execute(
      'SELECT id, full_name, email, role, phone_number FROM users WHERE id = ?', 
      [userId]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};