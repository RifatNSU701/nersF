import { Request, Response } from 'express';
import pool from '../config/database'; // Check your path

// GET /api/public/rates
export const getLiveRates = async (req: Request, res: Response) => {
    try {
        // Fetch all rates from DB (The Oracle keeps these updated)
        const [rows] = await pool.execute(
            'SELECT currency_code, rate_to_bdt, type, last_updated FROM exchange_rates ORDER BY type DESC, currency_code ASC'
        );
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rates' });
    }
};