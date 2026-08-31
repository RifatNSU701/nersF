import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { AuthRequest } from '../interfaces/request.interface';

const agentRoles = new Set(['ADMIN','SUPER_ADMIN','OFFICER','SUPPORT_AGENT']);

export const createTicket = async (req: AuthRequest,res:Response):Promise<void>=>{
 try{
  const {subject,priority='MEDIUM'}=req.body;
  if(!subject?.trim()){res.status(400).json({message:'A support subject is required.'});return;}
  const id=uuidv4();
  await pool.execute('INSERT INTO support_tickets (id,user_id,subject,priority,status) VALUES (?,?,?,?,?)',[id,req.user?.id,subject.trim(),priority,'OPEN']);
  res.status(201).json({message:'Support ticket created.',ticketId:id});
 }catch(e){console.error(e);res.status(500).json({message:'Unable to create support ticket.'});}
};

export const getMyTickets=async(req:AuthRequest,res:Response):Promise<void>=>{
 try{const [rows]=await pool.execute(`SELECT t.*, a.full_name assigned_agent_name FROM support_tickets t LEFT JOIN users a ON a.id=t.assigned_agent_id WHERE t.user_id=? ORDER BY t.updated_at DESC`,[req.user?.id]);res.json(rows);}catch{res.status(500).json({message:'Unable to load tickets.'});}
};

export const getSupportTickets=async(_req:AuthRequest,res:Response):Promise<void>=>{
 try{const [rows]=await pool.execute(`SELECT t.*, u.full_name user_name,u.email,a.full_name assigned_agent_name FROM support_tickets t JOIN users u ON u.id=t.user_id LEFT JOIN users a ON a.id=t.assigned_agent_id ORDER BY FIELD(t.status,'OPEN','IN_PROGRESS','RESOLVED','CLOSED'),t.updated_at DESC`);res.json(rows);}catch{res.status(500).json({message:'Unable to load support tickets.'});}
};

export const updateTicket=async(req:AuthRequest,res:Response):Promise<void>=>{
 try{
  const {status,priority}=req.body;
  if(!agentRoles.has(req.user?.role||'')){res.status(403).json({message:'Unauthorized.'});return;}
  const [result]:any=await pool.execute('UPDATE support_tickets SET status=?, priority=?, assigned_agent_id=COALESCE(assigned_agent_id, ?), updated_at=CURRENT_TIMESTAMP WHERE id=?',[status,priority,req.user?.id,req.params.id]);
  if(!result.affectedRows){res.status(404).json({message:'Ticket not found.'});return;}
  res.json({message:'Ticket updated.'});
 }catch{res.status(500).json({message:'Unable to update ticket.'});}
};

export const getMessages=async(req:AuthRequest,res:Response):Promise<void>=>{
 try{
  const [rows]:any=await pool.execute(`SELECT m.*,u.full_name sender_name FROM chat_messages m JOIN users u ON u.id=m.sender_user_id WHERE m.ticket_id=? AND (m.is_internal_note=0 OR ?) ORDER BY m.sent_at ASC`,[req.params.ticketId,agentRoles.has(req.user?.role||'')?1:0]);
  res.json(rows);
 }catch{res.status(500).json({message:'Unable to load messages.'});}
};

export const postMessage=async(req:AuthRequest,res:Response):Promise<void>=>{
 try{
  const {message,is_internal_note=false}=req.body;
  if(!message?.trim()){res.status(400).json({message:'Message cannot be empty.'});return;}
  const id=uuidv4();
  await pool.execute('INSERT INTO chat_messages (id,ticket_id,sender_user_id,message_text,is_internal_note) VALUES (?,?,?,?,?)',[id,req.params.ticketId,req.user?.id,message.trim(),agentRoles.has(req.user?.role||'')&&is_internal_note?1:0]);
  const {getIO}=await import('../services/socket.service');
  try{getIO().to('ticket_'+req.params.ticketId).emit('chat_message',{id,ticket_id:req.params.ticketId,sender_user_id:req.user?.id,sender_name:req.user?.name||'User',message_text:message.trim(),is_internal_note:!!is_internal_note,sent_at:new Date().toISOString()});}catch{}
  res.status(201).json({message:'Message sent.',messageId:id});
 }catch{res.status(500).json({message:'Unable to send message.'});}
};