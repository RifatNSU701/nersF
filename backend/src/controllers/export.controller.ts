import { Request, Response } from 'express';
import pool from '../config/database';

export const exportTableToCSV = async (req: Request, res: Response) => {
  try {
    // FIX: Cast as string so TypeScript knows it's not an array
    const tableName = req.params.tableName as string;

    // Security: Whitelist allowed tables
    const allowedTables = ['users', 'tenders', 'bids', 'inventory_items', 'audit_logs'];
    
    // Now this line will work because both are strings
    if (!allowedTables.includes(tableName)) {
      res.status(400).json({ message: 'Invalid table for export' });
      return;
    }

    // Fetch Data
    const [rows]: any[] = await pool.query(`SELECT * FROM ${tableName} LIMIT 1000`);

    if (rows.length === 0) {
      res.status(404).json({ message: 'No data found' });
      return;
    }

    // Convert to CSV Format
    // We map over rows and wrap values in quotes to handle commas inside data
    const headers = Object.keys(rows[0]).join(',');
    const csvRows = rows.map((row: any) => 
      Object.values(row).map(val => `"${val}"`).join(',') 
    );
    const csvString = [headers, ...csvRows].join('\n');

    // Send File
    res.header('Content-Type', 'text/csv');
    res.attachment(`${tableName}_export_${Date.now()}.csv`);
    res.send(csvString);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Export failed' });
  }
};