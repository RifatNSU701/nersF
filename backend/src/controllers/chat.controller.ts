import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { AuthRequest } from '../interfaces/request.interface';
import { getIO } from '../services/socket.service';

const agentRoles = new Set(['ADMIN', 'SUPER_ADMIN', 'OFFICER', 'SUPPORT_AGENT']);
const validStatuses = new Set(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
const validPriorities = new Set(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

const isAgent = (role: string) => agentRoles.has(role);

async function ticketAccess(ticketId: string, userId: string, role: string) {
  const [rows] = await pool.execute<any[]>('SELECT user_id FROM support_tickets WHERE id = ?', [ticketId]);
  if (!rows.length) return { exists: false, allowed: false };
  return { exists: true, allowed: rows[0].user_id === userId || isAgent(role) };
}

export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subject = String(req.body.subject || '').trim();
    const priority = String(req.body.priority || 'MEDIUM').toUpperCase();
    if (!subject) {
      res.status(400).json({ message: 'A support subject is required.' });
      return;
    }
    if (!validPriorities.has(priority)) {
      res.status(400).json({ message: 'Invalid support priority.' });
      return;
    }
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO support_tickets (id, user_id, subject, priority, status) VALUES (?, ?, ?, ?, ?)',
      [id, req.user!.id, subject, priority, 'OPEN'],
    );
    res.status(201).json({ id, subject, priority, status: 'OPEN' });
  } catch (error) {
    console.error('Unable to create support ticket:', error);
    res.status(500).json({ message: 'Unable to create support ticket.' });
  }
};

export const getMyTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, subject, priority, status, created_at, updated_at FROM support_tickets WHERE user_id = ? ORDER BY updated_at DESC',
      [req.user!.id],
    );
    res.json(rows);
  } catch (error) {
    console.error('Unable to list support tickets:', error);
    res.status(500).json({ message: 'Unable to load support tickets.' });
  }
};

export const getSupportTickets = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute(
      'SELECT t.*, u.full_name AS user_name, u.email, a.full_name AS assigned_agent_name FROM support_tickets t JOIN users u ON u.id = t.user_id LEFT JOIN users a ON a.id = t.assigned_agent_id ORDER BY t.updated_at DESC',
    );
    res.json(rows);
  } catch (error) {
    console.error('Unable to list support tickets:', error);
    res.status(500).json({ message: 'Unable to load support tickets.' });
  }
};

export const updateTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const status = String(req.body.status || '').toUpperCase();
    const priority = String(req.body.priority || '').toUpperCase();
    if (status && !validStatuses.has(status)) {
      res.status(400).json({ message: 'Invalid support status.' });
      return;
    }
    if (priority && !validPriorities.has(priority)) {
      res.status(400).json({ message: 'Invalid support priority.' });
      return;
    }
    if (!status && !priority) {
      res.status(400).json({ message: 'Provide a status or priority update.' });
      return;
    }
    const [result] = await pool.execute<any>(
      'UPDATE support_tickets SET status = COALESCE(NULLIF(?, \'\'), status), priority = COALESCE(NULLIF(?, \'\'), priority) WHERE id = ?',
      [status, priority, req.params.id],
    );
    if (!result.affectedRows) {
      res.status(404).json({ message: 'Support ticket not found.' });
      return;
    }
    res.json({ message: 'Support ticket updated.' });
  } catch (error) {
    console.error('Unable to update support ticket:', error);
    res.status(500).json({ message: 'Unable to update support ticket.' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const role = String(req.user!.role);
    const access = await ticketAccess(req.params.ticketId, req.user!.id, role);
    if (!access.exists) {
      res.status(404).json({ message: 'Support ticket not found.' });
      return;
    }
    if (!access.allowed) {
      res.status(403).json({ message: 'Not authorized for this support ticket.' });
      return;
    }
    const internalClause = isAgent(role) ? '' : ' AND m.is_internal_note = 0';
    const [rows] = await pool.execute(
      `SELECT m.id, m.ticket_id, m.sender_user_id, u.full_name AS sender_name, m.message_text, m.is_internal_note, m.sent_at
       FROM chat_messages m JOIN users u ON u.id = m.sender_user_id
       WHERE m.ticket_id = ?${internalClause} ORDER BY m.sent_at ASC`,
      [req.params.ticketId],
    );
    res.json(rows);
  } catch (error) {
    console.error('Unable to load support messages:', error);
    res.status(500).json({ message: 'Unable to load support messages.' });
  }
};

export const postMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const role = String(req.user!.role);
    const access = await ticketAccess(req.params.ticketId, req.user!.id, role);
    if (!access.exists) {
      res.status(404).json({ message: 'Support ticket not found.' });
      return;
    }
    if (!access.allowed) {
      res.status(403).json({ message: 'Not authorized for this support ticket.' });
      return;
    }
    const message = String(req.body.message || '').trim();
    const isInternalNote = Boolean(req.body.is_internal_note);
    if (!message) {
      res.status(400).json({ message: 'A message is required.' });
      return;
    }
    if (isInternalNote && !isAgent(role)) {
      res.status(403).json({ message: 'Only support staff can add internal notes.' });
      return;
    }
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO chat_messages (id, ticket_id, sender_user_id, message_text, is_internal_note) VALUES (?, ?, ?, ?, ?)',
      [id, req.params.ticketId, req.user!.id, message, isInternalNote ? 1 : 0],
    );
    await pool.execute('UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.ticketId]);
    const [users] = await pool.execute<any[]>('SELECT full_name FROM users WHERE id = ?', [req.user!.id]);
    const payload = {
      id,
      ticket_id: req.params.ticketId,
      sender_user_id: req.user!.id,
      sender_name: users[0]?.full_name || 'Support',
      message_text: message,
      is_internal_note: isInternalNote,
      sent_at: new Date().toISOString(),
    };
    if (!isInternalNote) getIO().to(`ticket_${req.params.ticketId}`).emit('chat_message', payload);
    res.status(201).json({ messageId: id, message: payload });
  } catch (error) {
    console.error('Unable to send support message:', error);
    res.status(500).json({ message: 'Unable to send support message.' });
  }
};
