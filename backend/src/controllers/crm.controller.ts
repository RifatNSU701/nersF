import { Response } from 'express';
import { AuthRequest } from '../interfaces/request.interface';
import pool from '../config/database';

const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export const createComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject, description } = req.body;
    if (!subject || !description) { res.status(400).json({ message: 'Subject and description are required.' }); return; }
    await pool.execute(`INSERT INTO complaints (user_id, subject, description, status) VALUES (?, ?, ?, 'PENDING')`, [req.user?.id, String(subject).trim(), String(description).trim()]);
    res.status(201).json({ message: 'Complaint submitted successfully.' });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Error submitting complaint' }); }
};

export const getMyComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute('SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC', [req.user?.id]);
    res.json(rows);
  } catch { res.status(500).json({ message: 'Error fetching complaints' }); }
};

export const getAllComplaints = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute(`SELECT c.id, c.subject, c.description, c.status, c.admin_reply, c.created_at, u.full_name, u.email FROM complaints c JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC`);
    res.json(rows);
  } catch { res.status(500).json({ message: 'Error fetching all complaints' }); }
};

export const updateComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, admin_reply } = req.body;
    if (!VALID_STATUSES.includes(status)) { res.status(400).json({ message: 'Invalid complaint status.' }); return; }
    const [result]: any[] = await pool.execute('UPDATE complaints SET status = ?, admin_reply = ? WHERE id = ?', [status, admin_reply || null, req.params.id]);
    if (!result.affectedRows) { res.status(404).json({ message: 'Complaint not found.' }); return; }
    res.json({ message: 'Complaint updated successfully.' });
  } catch { res.status(500).json({ message: 'Error updating complaint' }); }
};

export const submitFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rating, comment } = req.body;
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) { res.status(400).json({ message: 'Rating must be between 1 and 5.' }); return; }
    await pool.execute('INSERT INTO feedback (user_id, rating, comment) VALUES (?, ?, ?)', [req.user?.id || null, numericRating, comment || null]);
    res.status(201).json({ message: 'Thank you for your feedback!' });
  } catch { res.status(500).json({ message: 'Error submitting feedback' }); }
};