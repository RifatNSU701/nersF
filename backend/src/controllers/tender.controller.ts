import { Response } from 'express';
import { AuthRequest } from '../interfaces/request.interface';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';

export const createTender = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, reference_no, description, budget_min, budget_max, opening_date, closing_date, commodity_id, quantity_required_mt } = req.body;
    if (!req.user?.id) { res.status(401).json({ message: 'Unauthorized' }); return; }
    if (!title || !reference_no || !closing_date) { res.status(400).json({ message: 'Title, reference number and closing date are required.' }); return; }
    if (new Date(closing_date) <= new Date()) { res.status(400).json({ message: 'Closing date must be in the future.' }); return; }

    const [existing]: any[] = await pool.execute('SELECT id FROM tenders WHERE reference_no = ?', [reference_no]);
    if (existing.length) { res.status(409).json({ message: 'Tender reference number already exists.' }); return; }

    const id = uuidv4();
    const attachmentUrl = req.file ? req.file.path : null;
    await pool.execute(
      `INSERT INTO tenders (id, title, reference_no, description, budget_min, budget_max, opening_date, closing_date, commodity_id, quantity_required_mt, status, created_by, attachment_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)`,
      [id, title, reference_no, description || null, budget_min || 0, budget_max || 0, opening_date || new Date(), closing_date, commodity_id || null, quantity_required_mt || null, req.user.id, attachmentUrl]
    );
    res.status(201).json({ message: 'Tender created successfully', tenderId: id, attachment: attachmentUrl });
  } catch (error: any) {
    console.error('Create tender error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAllTenders = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows]: any[] = await pool.execute('SELECT * FROM tenders WHERE status = ? AND closing_date > NOW() ORDER BY created_at DESC', ['OPEN']);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Get tenders error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getTenderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows]: any[] = await pool.execute('SELECT * FROM tenders WHERE id = ?', [req.params.id]);
    if (!rows.length) { res.status(404).json({ message: 'Tender not found.' }); return; }
    res.status(200).json(rows[0]);
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const closeTender = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [result]: any[] = await pool.execute('UPDATE tenders SET status = ? WHERE id = ? AND status = ?', ['CLOSED', req.params.id, 'OPEN']);
    if (!result.affectedRows) { res.status(404).json({ message: 'Open tender not found.' }); return; }
    res.status(200).json({ message: 'Tender closed successfully.' });
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
};