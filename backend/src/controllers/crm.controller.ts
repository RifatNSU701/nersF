import { Request, Response } from 'express';
import pool from '../config/database';

// ==========================================
// 1. COMPLAINTS (Authenticated Users Only)
// ==========================================

export const createComplaint = async (req: Request, res: Response) => {
  try {
    const { subject, description } = req.body;
    // We get the user ID from the Auth Middleware
    const userId = (req as any).user?.id; 

    if (!userId) {
       res.status(401).json({ message: "Unauthorized" });
       return;
    }

    await pool.execute(
      `INSERT INTO complaints (user_id, subject, description, status) 
       VALUES (?, ?, ?, 'PENDING')`,
      [userId, subject, description]
    );

    res.status(201).json({ message: 'Complaint submitted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting complaint' });
  }
};

export const getMyComplaints = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    const [rows] = await pool.execute(
      `SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaints' });
  }
};

// ==========================================
// 2. ADMIN ACTIONS (Resolve Complaints)
// ==========================================

export const getAllComplaints = async (req: Request, res: Response) => {
  try {
    // Admin only: Join with users table to see WHO complained
    const [rows] = await pool.execute(
      `SELECT c.id, c.subject, c.status, c.created_at, u.full_name, u.email 
       FROM complaints c 
       JOIN users u ON c.user_id = u.id 
       ORDER BY c.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching all complaints' });
  }
};

export const resolveComplaint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, admin_reply } = req.body;

    await pool.execute(
      `UPDATE complaints 
       SET status = ?, admin_reply = ? 
       WHERE id = ?`,
      [status, admin_reply, id]
    );

    res.json({ message: 'Complaint updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating complaint' });
  }
};

// ==========================================
// 3. FEEDBACK (Public / Anonymous)
// ==========================================

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const userId = (req as any).user?.id || null; // Optional

    await pool.execute(
      `INSERT INTO feedback (user_id, rating, comment) VALUES (?, ?, ?)`,
      [userId, rating, comment]
    );

    res.status(201).json({ message: 'Thank you for your feedback!' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting feedback' });
  }
};