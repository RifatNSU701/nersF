import { Response } from 'express'; 
import { AuthRequest } from '../interfaces/request.interface'; 
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';

// ==========================================
// 1. CREATE TENDER (Fully Compliant + PDF Upload)
// ==========================================
export const createTender = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      title, 
      reference_no, 
      description, 
      budget_min, 
      budget_max, 
      opening_date, 
      closing_date,
      commodity_id,
      quantity_required_mt
    } = req.body;

    // 1. Security Check: ensure user exists
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Unauthorized: No User Found' });
        return;
    }
    const userId = req.user.id; 

    // 2. Validation
    if (!title || !reference_no || !closing_date) {
      res.status(400).json({ message: 'Title, Reference No, and Closing Date are required' });
      return;
    }

    // 3. FILE UPLOAD LOGIC (This fixes your error)
    // We check if a file was uploaded. If yes, we grab the path. If no, it is null.
    // Note: TypeScript knows 'file' exists on 'req' because we installed @types/multer
    const attachmentUrl = req.file ? req.file.path : null;

    const id = uuidv4();
    const validOpeningDate = opening_date || new Date(); 

    // 4. SQL: Includes 'attachment_url'
    const sql = `
      INSERT INTO tenders (
        id, title, reference_no, description, 
        budget_min, budget_max, 
        opening_date, closing_date, 
        commodity_id, quantity_required_mt, 
        status, created_by, attachment_url
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)
    `;

    // 5. Execute with all parameters (including the new attachmentUrl)
    await pool.execute(sql, [
      id,
      title,
      reference_no,
      description || null,
      budget_min || 0,
      budget_max || 0,
      validOpeningDate,
      closing_date,
      commodity_id || null,         
      quantity_required_mt || null,
      userId,
      attachmentUrl // <--- Now this variable is defined and ready to use!
    ]);

    res.status(201).json({ 
      message: 'Tender created successfully', 
      tenderId: id,
      type: commodity_id ? 'COMMODITY_PROCUREMENT' : 'GENERAL_CONTRACT',
      attachment: attachmentUrl
    });

  } catch (error: any) {
    console.error('Error creating tender:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// ==========================================
// 2. GET ALL OPEN TENDERS
// ==========================================
export const getAllTenders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows]: any[] = await pool.execute('SELECT * FROM tenders WHERE status = "OPEN" ORDER BY created_at DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching tenders:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};