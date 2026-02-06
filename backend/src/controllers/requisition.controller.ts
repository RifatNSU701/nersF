import { Request, Response } from 'express';
import pool from '../config/database';
import { ResultSetHeader } from 'mysql2';

// interface for the incoming data
interface RequisitionItem {
    commodity_id: string; // UUID
    quantity: number;
}

// ==========================================
// 1. CREATE REQUISITION (POST)
// ==========================================
export const createRequisition = async (req: Request, res: Response) => {
    const { warehouse_id, project_name, items } = req.body;
    const requester_id = req.body.requester_id; // Temporary: passed in body for testing

    if (!warehouse_id || !project_name || !items || items.length === 0) {
        return res.status(400).json({ message: 'Missing required fields or empty items list' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction(); // 🔒 START TRANSACTION

        // Insert Header
        const [reqResult] = await connection.execute<ResultSetHeader>(
            `INSERT INTO requisitions (requester_id, warehouse_id, project_name, status) 
             VALUES (?, ?, ?, 'PENDING')`,
            [requester_id, warehouse_id, project_name]
        );
        
        const requisitionId = reqResult.insertId;

        // Insert Items
        const itemQuery = `INSERT INTO requisition_items (requisition_id, commodity_id, quantity_requested) VALUES (?, ?, ?)`;
        
        for (const item of items as RequisitionItem[]) {
            await connection.execute(itemQuery, [requisitionId, item.commodity_id, item.quantity]);
        }

        await connection.commit();
        res.status(201).json({ 
            message: 'Requisition submitted successfully', 
            requisition_id: requisitionId 
        });

    } catch (error) {
        await connection.rollback();
        console.error('Requisition Error:', error);
        res.status(500).json({ message: 'Failed to create requisition' });
    } finally {
        connection.release();
    }
};

// ==========================================
// 2. APPROVE REQUISITION (PUT)
// ==========================================
export const approveRequisition = async (req: Request, res: Response) => {
    const requisitionId = req.params.id;
    const { approved_by } = req.body; 

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction(); // 🔒 START TRANSACTION

        // Get Requisition
        const [reqRows]: any = await connection.execute(
            `SELECT * FROM requisitions WHERE id = ? AND status = 'PENDING' FOR UPDATE`,
            [requisitionId]
        );

        if (reqRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Requisition not found or already processed' });
        }

        const requisition = reqRows[0];
        const warehouseId = requisition.warehouse_id;

        // Get Items
        const [items]: any = await connection.execute(
            `SELECT * FROM requisition_items WHERE requisition_id = ?`, 
            [requisitionId]
        );

        // Deduct Stock
        for (const item of items) {
            const [stockRows]: any = await connection.execute(
                `SELECT quantity FROM warehouse_stocks 
                 WHERE warehouse_id = ? AND commodity_id = ? FOR UPDATE`,
                [warehouseId, item.commodity_id]
            );

            const currentStock = stockRows.length > 0 ? parseFloat(stockRows[0].quantity) : 0;
            const requestedQty = parseFloat(item.quantity_requested);

            if (currentStock < requestedQty) {
                await connection.rollback();
                return res.status(400).json({ 
                    message: `Insufficient stock for commodity ID: ${item.commodity_id}. Have: ${currentStock}, Need: ${requestedQty}` 
                });
            }

            await connection.execute(
                `UPDATE warehouse_stocks 
                 SET quantity = quantity - ? 
                 WHERE warehouse_id = ? AND commodity_id = ?`,
                [requestedQty, warehouseId, item.commodity_id]
            );

            await connection.execute(
                `UPDATE requisition_items SET quantity_approved = ? WHERE id = ?`,
                [requestedQty, item.id]
            );
        }

        // Update Status
        await connection.execute(
            `UPDATE requisitions 
             SET status = 'APPROVED', approved_by = ?, approval_date = NOW() 
             WHERE id = ?`,
            [approved_by, requisitionId]
        );

        await connection.commit();
        res.status(200).json({ message: 'Requisition Approved & Stock Deducted' });

    } catch (error) {
        await connection.rollback();
        console.error('Approval Error:', error);
        res.status(500).json({ message: 'Approval Failed' });
    } finally {
        connection.release();
    }
};

// ==========================================
// 3. GET ALL REQUISITIONS (GET)
// ==========================================
export const getAllRequisitions = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.execute(
            `SELECT 
                r.id, 
                r.project_name, 
                r.status, 
                r.created_at,
                w.name as warehouse_name,
                u.email as requester_email
             FROM requisitions r
             JOIN warehouses w ON r.warehouse_id = w.id
             JOIN users u ON r.requester_id = u.id
             ORDER BY r.created_at DESC`
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ message: 'Failed to fetch requisitions' });
    }
};