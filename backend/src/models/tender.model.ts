import pool from '../config/database';
import { Tender, TenderRow, TenderStatus } from '../interfaces/tender.interface';
import { v4 as uuidv4 } from 'uuid';

export class TenderModel {

  // 1. Create New Tender (Admin Only)
  static async create(tender: Tender): Promise<string> {
    const id = uuidv4();
    const sql = `
      INSERT INTO tenders 
      (id, reference_no, title, description, budget_min, budget_max, opening_date, closing_date, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(sql, [
      id,
      tender.reference_no,
      tender.title,
      tender.description,
      tender.budget_min,
      tender.budget_max,
      tender.opening_date,
      tender.closing_date,
      tender.status || TenderStatus.OPEN,
      tender.created_by
    ]);

    return id;
  }

  // 2. Get All Open Tenders (Public View)
  static async findAllOpen(): Promise<Tender[]> {
    const sql = `
      SELECT id, reference_no, title, budget_max, closing_date, status 
      FROM tenders 
      WHERE status = 'OPEN' AND closing_date > NOW()
      ORDER BY created_at DESC
    `;
    const [rows] = await pool.query<TenderRow[]>(sql);
    return rows;
  }

  // 3. Get Single Tender Details
  static async findById(id: string): Promise<Tender | null> {
    const sql = `SELECT * FROM tenders WHERE id = ?`;
    const [rows] = await pool.execute<TenderRow[]>(sql, [id]);
    
    if (rows.length === 0) return null;
    return rows[0];
  }
}