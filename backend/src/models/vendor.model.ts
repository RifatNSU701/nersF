import pool from '../config/database'; // FIX: Default Import
import { VendorProfile } from '../interfaces/vendor.interface';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export class VendorModel {

  // 1. CREATE A NEW PROFILE
  static async create(profile: VendorProfile): Promise<string> {
    const id = uuidv4();
    
    // We explicitly type the status to match the interface or string
    const status = 'PENDING';

    const sql = `
      INSERT INTO vendor_profiles 
      (id, user_id, company_name, trade_license_no, tax_id_no, address_line, city, compliance_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Execute the query
    await pool.execute<ResultSetHeader>(sql, [
      id,
      profile.user_id,
      profile.company_name,
      profile.trade_license_no,
      profile.tax_id_no,
      profile.address_line,
      profile.city,
      status
    ]);

    return id;
  }

  // 2. FIND BY USER ID
  static async findByUserId(userId: string): Promise<VendorProfile | null> {
    const sql = `SELECT * FROM vendor_profiles WHERE user_id = ?`;
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId]);
    
    if (rows.length === 0) return null;
    return rows[0] as VendorProfile;
  }

  // 3. FIND BY TRADE LICENSE
  static async findByLicense(licenseNo: string): Promise<VendorProfile | null> {
    const sql = `SELECT * FROM vendor_profiles WHERE trade_license_no = ?`;
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [licenseNo]);
    
    if (rows.length === 0) return null;
    return rows[0] as VendorProfile;
  }
}