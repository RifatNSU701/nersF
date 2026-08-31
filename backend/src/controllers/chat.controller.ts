import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { AuthRequest } from '../interfaces/request.interface';

const agentRoles=new Set(['ADMIN','SUPER_ADMIN','OFFICER','SUPPORT_AGENT']);
const validStatuses=new Set(['OPEN','IN_PROGRESS','RESOLVED','CLOSED']);
const validPriorities=new Set(['LOW','MEDIUM','HIGH','URGENT']);

async function ticketAccess(ticketId:string,userId:string,role:string){
 const [rows]:any=await pool.execute('SELECT user_id FROM support_tickets WHERE id=?',[ticketId]);
 if(!rows.length)return {exists:false,allowed:false};
 return {exists:true,allowed:rows[0].user_id===userId||agentRoles.has(role)};
}
export const createTicket=async(req:AuthRequest,res:Response):Promise<void>=>{
 try{const {subject,priority='MEDIUM'}=req.body;if(!subject?.trim()){res.status(400).json({message:'A support subject is required.'});return;}const p=String(priority).toUpperCase();if(!validPriori[...]
};
export const getMyTickets=async(req:AuthRequest,res:Response):Promise<void>=>{try{const [rows]=await pool.execute('SELECT t.*,a.full_name assigned_agent_name FROM support_tickets t LEFT JOIN users[...]
export const getSupportTickets=async(_req:AuthRequest,res:Response):Promise<void>=>{try{const [rows]=await pool.execute("SELECT t.*,u.full_name user_name,u.email,a.full_name assigned_agent_name FR[...]
export const updateTicket=async(req:AuthRequest,res:Response):Promise<void>=>{try{const {status,priority}=req.body;const s=String(status||'').toUpperCase(),p=String(priority||'MEDIUM').toUpperCase[...]
export const getMessages=async(req:AuthRequest,res:Response):Promise<void>=>{try{const access=await ticketAccess(req.params.ticketId,req.user!.id,String(req.user!.role));if(!access.exists){res.status(404)[...]
export const postMessage=async(req:AuthRequest,res:Response):Promise<void>=>{try{const access=await ticketAccess(req.params.ticketId,req.user!.id,String(req.user!.role));if(!access.exists){res.status(404)[...]
