import { Request, Response } from 'express';
import { AuthRequest } from '../interfaces/request.interface';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';

// ==========================================
// 1. SUBMIT BID (Vendor Offer)
// ==========================================
export const submitBid = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tender_id, price_per_mt, delivery_days } = req.body;

    // 1. Identify Vendor from Token
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const vendorId = req.user.id;

    // 2. Validate Input
    if (!tender_id || !price_per_mt || !delivery_days) {
      res.status(400).json({ message: 'Tender ID, Price per MT, and Delivery Days are required' });
      return;
    }

    // 3. Check if Tender is OPEN
    const [tenders]: any[] = await pool.execute('SELECT status FROM tenders WHERE id = ?', [tender_id]);
    
    if (tenders.length === 0) {
        res.status(404).json({ message: 'Tender not found' });
        return;
    }
    if (tenders[0].status !== 'OPEN') {
        res.status(400).json({ message: 'This tender is closed for bidding' });
        return;
    }

    const id = uuidv4();

    // 4. Insert Bid
    const sql = `
      INSERT INTO bids (id, tender_id, vendor_id, price_per_mt, delivery_days, status) 
      VALUES (?, ?, ?, ?, ?, 'PENDING')
    `;

    await pool.execute(sql, [id, tender_id, vendorId, price_per_mt, delivery_days]);

    res.status(201).json({ message: 'Bid submitted successfully', bidId: id });

  } catch (error: any) {
    console.error('Error submitting bid:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ==========================================
// 2. GET BIDS FOR A TENDER (Admin View)
// ==========================================
export const getBidsByTender = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check both parameter names just in case
    const tenderId = req.params.tenderId || req.params.id;
    
    console.log("🔍 Admin requested bids for Tender ID:", tenderId);

    if (!tenderId) {
       res.status(400).json({ message: 'Tender ID is missing.' });
       return;
    }
    
    // Join with Users table to see WHO bid
    // FIX APPLIED: Using 'u.full_name' instead of 'u.name'
    const sql = `
      SELECT b.*, u.full_name as vendor_name, u.email 
      FROM bids b
      JOIN users u ON b.vendor_id = u.id
      WHERE b.tender_id = ?
      ORDER BY b.price_per_mt ASC 
    `; 

    const [rows]: any[] = await pool.execute(sql, [tenderId]);
    
    console.log(`✅ Database found ${rows.length} bids.`);
    res.status(200).json(rows);

  } catch (error: any) {
    console.error('❌ CRITICAL ERROR in getBidsByTender:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};