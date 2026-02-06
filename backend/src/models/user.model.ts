import pool from '../config/database'; // FIX 1: Restored Default Import
import { User } from '../interfaces/user.interface';
import { v4 as uuidv4 } from 'uuid'; // FIX 2: Restored UUID generation
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class UserModel {

  // 1. CREATE USER
  static async create(user: User): Promise<string> {
    const id = uuidv4(); // Generate ID in Node.js (Safer)
    const { full_name, email, password_hash, phone_number, role } = user;
    
    // FIX: Inserting 'role' string directly. No 'role_id'.
    const sql = `
      INSERT INTO users (id, full_name, email, password_hash, phone_number, role, is_verified) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await pool.execute<ResultSetHeader>(sql, [
      id,
      full_name, 
      email, 
      password_hash, 
      phone_number, 
      role || 'VISITOR', // Default to VISITOR
      0 // is_verified = false
    ]);
    
    return id; // Return the ID immediately
  }

  // 2. FIND BY EMAIL
  static async findByEmail(email: string): Promise<User | null> {
    // FIX: Simple SELECT. No JOINs.
    const sql = `
      SELECT id, full_name, email, password_hash, phone_number, role, is_active, is_verified 
      FROM users 
      WHERE email = ? AND deleted_at IS NULL
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [email]);
    
    if (rows.length === 0) return null;

    return rows[0] as User;
  }

  // 3. FIND BY ID
  static async findById(id: string): Promise<User | null> {
    // FIX: Simple SELECT. No JOINs.
    const sql = `
      SELECT id, full_name, email, role, phone_number, is_active, is_verified
      FROM users 
      WHERE id = ? AND deleted_at IS NULL
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [id]);

    if (rows.length === 0) return null;

    return rows[0] as User;
  }
}