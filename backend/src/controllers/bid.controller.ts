import { Response } from 'express';
import { AuthRequest } from '../interfaces/request.interface';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';

const evaluatorRoles = new Set(['ADMIN', 'SUPER_ADMIN', 'TENDER_OFFICER']);

export const submitBid = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tender_id, price_per_mt, delivery_days } = req.body;
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ message: 'Unauthorized' }); return; }
    const [vendorRows]: any[] = await pool.execute('SELECT id FROM vendors WHERE user_id = ?', [userId]);
    if (!vendorRows.length) { res.status(403).json({ message: 'A verified vendor profile is required to submit bids.' }); return; }
    const vendorId = vendorRows[0].id;
    if (!tender_id || price_per_mt === undefined || delivery_days === undefined) { res.status(400).json({ message: 'Tender ID, price and delivery days are required.' }); return; }
    if (Number(price_per_mt) <= 0 || Number(delivery_days) <= 0) { res.status(400).json({ message: 'Price and delivery days must be positive values.' }); return; }

    const [tenders]: any[] = await pool.execute('SELECT id, status, closing_date FROM tenders WHERE id = ?', [tender_id]);
    if (!tenders.length) { res.status(404).json({ message: 'Tender not found.' }); return; }
    if (tenders[0].status !== 'OPEN' || new Date(tenders[0].closing_date) <= new Date()) { res.status(400).json({ message: 'This tender is closed for bidding.' }); return; }

    const [existing]: any[] = await pool.execute('SELECT id FROM bids WHERE tender_id = ? AND vendor_id = ?', [tender_id, vendorId]);
    if (existing.length) { res.status(409).json({ message: 'You have already submitted a bid for this tender.' }); return; }

    const id = uuidv4();
    await pool.execute('INSERT INTO bids (id, tender_id, vendor_id, price_per_mt, delivery_days, status) VALUES (?, ?, ?, ?, ?, ?)', [id, tender_id, vendorId, Number(price_per_mt), Number(delivery_days), 'PENDING']);
    res.status(201).json({ message: 'Bid submitted successfully', bidId: id });
  } catch (error) { console.error('Bid submission error:', error); res.status(500).json({ message: 'Server Error' }); }
};

export const getMyBids = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows]: any[] = await pool.execute(`SELECT b.*, t.title, t.reference_no, t.closing_date FROM bids b JOIN tenders t ON b.tender_id = t.id JOIN vendors v ON b.vendor_id = v.id WHERE v.user_id = ? ORDER BY b.created_at DESC`, [req.user?.id]);
    res.status(200).json(rows);
  } catch (error) { console.error('My bids error:', error); res.status(500).json({ message: 'Server Error' }); }
};

export const getBidsByTender = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenderId = req.params.tenderId;
    const [rows]: any[] = await pool.execute(`SELECT b.*, u.full_name as vendor_name, u.email FROM bids b JOIN vendors v ON b.vendor_id = v.id JOIN users u ON v.user_id = u.id WHERE b.tender_id = ? ORDER BY b.price_per_mt ASC`, [tenderId]);
    res.status(200).json(rows);
  } catch (error) { console.error('Tender bids error:', error); res.status(500).json({ message: 'Server Error' }); }
};

export const evaluateBid = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const role = req.user?.role;
    if (!role || !evaluatorRoles.has(role)) { res.status(403).json({ message: 'Only authorized procurement officers can evaluate bids.' }); return; }
    const { decision } = req.body;
    if (!['SHORTLISTED', 'REJECTED'].includes(decision)) { res.status(400).json({ message: 'Decision must be SHORTLISTED or REJECTED.' }); return; }
    const [result]: any[] = await pool.execute('UPDATE bids SET status = ? WHERE id = ? AND status = ?', [decision, req.params.bidId, 'PENDING']);
    if (!result.affectedRows) { res.status(404).json({ message: 'Pending bid not found.' }); return; }
    res.status(200).json({ message: 'Bid evaluation updated.', status: decision });
  } catch (error) { console.error('Bid evaluation error:', error); res.status(500).json({ message: 'Server Error' }); }
};

export const awardTender = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const role = req.user?.role;
    if (!role || !evaluatorRoles.has(role)) { connection.release(); res.status(403).json({ message: 'Only authorized procurement officers can award tenders.' }); return; }
    await connection.beginTransaction();

    const [bids]: any[] = await connection.execute('SELECT * FROM bids WHERE id = ? AND tender_id = ?', [req.params.bidId, req.params.tenderId]);
    if (!bids.length) { await connection.rollback(); connection.release(); res.status(404).json({ message: 'Bid not found for this tender.' }); return; }

    const [tenders]: any[] = await connection.execute('SELECT status FROM tenders WHERE id = ? FOR UPDATE', [req.params.tenderId]);
    if (!tenders.length || tenders[0].status !== 'CLOSED') { await connection.rollback(); connection.release(); res.status(400).json({ message: 'Tender cannot be awarded in its current state.' }); return; }

    await connection.execute('UPDATE bids SET status = ? WHERE tender_id = ? AND id <> ? AND status IN (?, ?)', ['REJECTED', req.params.tenderId, req.params.bidId, 'PENDING', 'SHORTLISTED']);
    await connection.execute('UPDATE bids SET status = ? WHERE id = ?', ['AWARDED', req.params.bidId]);
    await connection.execute('UPDATE tenders SET status = ? WHERE id = ?', ['AWARDED', req.params.tenderId]);

    await connection.commit();
    connection.release();
    res.status(200).json({ message: 'Tender awarded successfully.', winningBidId: req.params.bidId });
  } catch (error) {
    await connection.rollback(); connection.release();
    console.error('Tender award error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};