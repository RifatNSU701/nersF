import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database'; // Ensure this matches your actual db config path (e.g., ../config/database)
import { RowDataPacket } from 'mysql2';

// ==========================================
// 1. WAREHOUSE LOGIC
// ==========================================
export const createWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, location, capacity_mt, manager_name } = req.body;
    
    if (!name || !location || !capacity_mt) {
      res.status(400).json({ message: 'Name, Location, and Capacity are required' });
      return;
    }

    const id = uuidv4();
    
    const sql = `
      INSERT INTO warehouses (id, name, location, capacity_mt, manager_name, status) 
      VALUES (?, ?, ?, ?, ?, 'ACTIVE')
    `;

    await pool.execute(sql, [
      id, 
      name, 
      location, 
      capacity_mt, 
      manager_name || 'Unassigned'
    ]);

    res.status(201).json({ message: 'Warehouse created successfully', warehouseId: id });
  } catch (error) {
    console.error('Error creating warehouse:', error);
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const getAllWarehouses = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute('SELECT * FROM warehouses ORDER BY created_at DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==========================================
// 2. COMMODITY LOGIC (The Master List)
// ==========================================
export const createCommodity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, category, description } = req.body; 
      
      const id = uuidv4();
      await pool.execute(
        `INSERT INTO commodities (id, name, category, description) VALUES (?, ?, ?, ?)`,
        [id, name, category, description]
      );
      res.status(201).json({ message: 'Commodity added to Master List', commodityId: id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
};

export const getCommodities = async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.execute('SELECT * FROM commodities ORDER BY name ASC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// 3. STOCK LOGIC (Updated with Pricing)
// ==========================================
export const addStock = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Get fields including NEW Pricing fields
        const { 
            warehouse_id, 
            commodity_id, 
            batch_number, 
            quantity_mt, 
            expiry_date,
            unit_price,     // <--- NEW
            currency        // <--- NEW
        } = req.body;

        // 2. Validation
        if (!warehouse_id || !commodity_id || !quantity_mt || !expiry_date) {
            res.status(400).json({ message: 'Warehouse, Commodity, Quantity, and Expiry are required' });
            return;
        }

        const id = uuidv4();
        
        // 3. Insert into Database
        // Note: 'total_value' is NOT inserted here because it is a GENERATED COLUMN in MySQL.
        // MySQL will automatically calculate (quantity_mt * unit_price).
        const sql = `
            INSERT INTO stocks 
            (id, warehouse_id, commodity_id, batch_number, quantity_mt, expiry_date, unit_price, currency, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        await pool.execute(sql, [
            id, 
            warehouse_id, 
            commodity_id, 
            batch_number, 
            quantity_mt, 
            expiry_date,
            unit_price || 0.00,  // Default 0 if missing
            currency || 'BDT'    // Default BDT if missing
        ]);

        res.status(201).json({ 
            message: 'Stock added with Pricing successfully', 
            stockId: id 
        });

    } catch (error) {
        console.error('Error adding stock:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const getStockByWarehouse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { warehouseId } = req.params;
        
        // Updated Query: Now selects unit_price, total_value, and currency
        const sql = `
            SELECT 
                s.id, 
                s.batch_number, 
                s.quantity_mt, 
                s.expiry_date,
                s.unit_price,       -- <--- NEW
                s.total_value,      -- <--- NEW (Calculated by DB)
                s.currency,         -- <--- NEW
                c.name as commodity_name, 
                c.category 
            FROM stocks s
            JOIN commodities c ON s.commodity_id = c.id
            WHERE s.warehouse_id = ?
            ORDER BY s.expiry_date ASC
        `;
        
        const [rows] = await pool.execute(sql, [warehouseId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};