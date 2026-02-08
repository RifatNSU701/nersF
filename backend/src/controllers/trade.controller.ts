import { Request, Response } from 'express';
import pool from '../config/database';

// ==========================================
// 1. TRADE CONTRACTS (Commercial)
// ==========================================

export const createTrade = async (req: Request, res: Response) => {
  try {
    const { 
      reference_id, trade_type, resource_type, 
      quantity, unit, price_per_unit, 
      partner_country, partner_company, contract_date 
    } = req.body;

    await pool.execute(
      `INSERT INTO energy_trades 
      (reference_id, trade_type, resource_type, quantity, unit, price_per_unit, partner_country, partner_company, contract_date, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'SIGNED')`,
      [reference_id, trade_type, resource_type, quantity, unit, price_per_unit, partner_country, partner_company, contract_date]
    );

    res.status(201).json({ message: 'Energy Trade Contract Signed Successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating trade contract' });
  }
};

export const getTrades = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM energy_trades ORDER BY contract_date DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trades' });
  }
};

// ==========================================
// 2. LOGISTICS (Shipments)
// ==========================================

export const addShipment = async (req: Request, res: Response) => {
  try {
    const { 
      trade_id, tracking_number, carrier_name, vessel_name, 
      origin_port, destination_port, departure_date, estimated_arrival 
    } = req.body;

    await pool.execute(
      `INSERT INTO shipments 
      (trade_id, tracking_number, carrier_name, vessel_name, origin_port, destination_port, departure_date, estimated_arrival) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [trade_id, tracking_number, carrier_name, vessel_name, origin_port, destination_port, departure_date, estimated_arrival]
    );

    res.status(201).json({ message: 'Shipment Scheduled Successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding shipment' });
  }
};

export const updateShipmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, current_location } = req.body;

    await pool.execute(
      `UPDATE shipments 
       SET status = ?, current_location = ? 
       WHERE id = ?`,
      [status, current_location, id]
    );

    res.json({ message: 'Shipment Status Updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating shipment' });
  }
};

export const getActiveShipments = async (req: Request, res: Response) => {
  try {
    // Join shipments with trade info so we know WHAT is on the ship
    const [rows] = await pool.execute(
      `SELECT s.*, t.reference_id, t.resource_type, t.quantity, t.unit 
       FROM shipments s
       JOIN energy_trades t ON s.trade_id = t.id
       WHERE s.status NOT IN ('DELIVERED', 'CANCELLED')
       ORDER BY s.estimated_arrival ASC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active shipments' });
  }
};