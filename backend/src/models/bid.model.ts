import pool from '../config/database';
import { Bid, BidRow, BidStatus } from '../interfaces/bid.interface';
import { v4 as uuidv4 } from 'uuid';

export class BidModel {

  // 1. Submit a New Bid
  static async create(bid: Bid): Promise<string> {
    const id = uuidv4();
    const sql = `
      INSERT INTO bids 
      (id, tender_id, vendor_id, bid_amount, proposal_text, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(sql, [
      id,
      bid.tender_id,
      bid.vendor_id,
      bid.bid_amount,
      bid.proposal_text,
      bid.status || BidStatus.PENDING
    ]);

    return id;
  }

  // 2. Get All Bids for a Specific Tender
  static async findByTenderId(tenderId: string): Promise<Bid[]> {
    const sql = `
      SELECT * FROM bids 
      WHERE tender_id = ? 
      ORDER BY bid_amount ASC
    `;
    const [rows] = await pool.execute<BidRow[]>(sql, [tenderId]);
    return rows;
  }
  
  // 3. Check if Vendor already bid on this tender
  static async hasVendorBid(tenderId: string, vendorId: string): Promise<boolean> {
    const sql = `SELECT id FROM bids WHERE tender_id = ? AND vendor_id = ?`;
    const [rows] = await pool.execute<BidRow[]>(sql, [tenderId, vendorId]);
    return rows.length > 0;
  }

  // 4. Update Bid Status (Award/Reject) - THIS WAS MISSING
  static async updateStatus(bidId: string, status: BidStatus): Promise<void> {
    const sql = `UPDATE bids SET status = ? WHERE id = ?`;
    await pool.execute(sql, [status, bidId]);
  }
}