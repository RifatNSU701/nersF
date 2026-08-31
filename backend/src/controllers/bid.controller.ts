import { Request, Response } from 'express';
import { AuthRequest } from '../interfaces/request.interface';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';

export const submitBid = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tender_id, price_per_mt, delivery_days } = req.body;
    const vendorId = req.user?.id;

    if (!vendorId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!tender_id || price_per_mt === undefined || delivery_days === undefined) {
      res.status(400).json({ message: 'Tender ID, price and delivery days are required.' });
      return;
    }

    if (Number(price_per_mt) <= 0 || Number(delivery_days) <= 0) {
      res.status(400).json({ message: 'Price and delivery days must be positive values.' });
      return;
    }

    const [tenders]: any[] = await pool.execute(
      'SELECT id, status, closing_date FROM tenders WHERE id = ?',
      [tender_id]
    );

    if (tenders.length === 0) {
      res.status(404).json({ message: 'Tender not found.' });
      return;
    }

    const tender = tenders[0];
    if (tender.status !== 'OPEN' || new Date(tender.closing_date) <= new Date()) {
      res.status(400).json({ message: 'This tender is closed for bidding.' });
      return;
    }

    const [existingBids]: any[] = await pool.execute(
      'SELECT id FROM bids WHERE tender_id = ? AND vendor_id = ?',
      [tender_id, vendorId]
    );

    if (existingBids.length > 0) {
      res.status(409).json({ message: 'You have already submitted a bid for this tender.' });
      return;
    }

    const id = uuidv4();
    await pool.execute(
      'INSERT INTO bids (id, tender_id, vendor_id, price_per_mt, delivery_days, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, tender_id, vendorId, Number(price_per_mt), Number(delivery_days), 'PENDING']
    );

    res.status(201).json({ message: 'Bid submitted successfully', bidId: id });
  } catch (error: any) {
    console.error('Bid submission error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getMyBids = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vendorId = req.user?.id;
    const [rows]: any[] = await pool.execute(
      `SELECT b.*, t.title, t.reference_no, t.closing_date
       FROM bids b JOIN tenders t ON b.tender_id = t.id
       WHERE b.vendor_id = ? ORDER BY b.created_at DESC`,
      [vendorId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('My bids error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getBidsByTender = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenderId = req.params.tenderId || req.params.id;
    if (!tenderId) {
      res.status(400).json({ message: 'Tender ID is required.' });
      return;
    }

    const [rows]: any[] = await pool.execute(
      `SELECT b.*, u.full_name as vendor_name, u.email
       FROM bids b JOIN users u ON b.vendor_id = u.id
       WHERE b.tender_id = ? ORDER BY b.price_per_mt ASC`,
      [tenderId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Tender bids error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};