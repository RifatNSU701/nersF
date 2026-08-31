import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../interfaces/request.interface';

export const getAuditLogs=async(req:AuthRequest,res:Response):Promise<void>=>{
 try{
  const page=Math.max(1,Number(req.query.page)||1);const limit=Math.min(100,Math.max(1,Number(req.query.limit)||25));const offset=(page-1)*limit;
  const search=String(req.query.search||'').trim();const action=String(req.query.action||'').trim();
  let where='WHERE 1=1';const params:any[]=[];
  if(search){where+=' AND (a.action LIKE ? OR a.entity LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)';params.push('%'+search+'%','%'+search+'%','%'+search+'%','%'+search+'%');}
  if(action){where+=' AND a.action=?';params.push(action);}
  const [rows]=await pool.query(`SELECT a.id,a.user_id,a.action,a.entity,a.entity_id,a.details,a.ip_address,a.created_at,u.full_name,u.email FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id ${where} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,[...params,limit,offset]);
  const [[count]]:any=await pool.query(`SELECT COUNT(*) total FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id ${where}`,params);
  res.json({data:rows,page,limit,total:count.total});
 }catch(e){console.error(e);res.status(500).json({message:'Unable to load audit logs.'});}
};

export const getAuditSummary=async(_req:AuthRequest,res:Response):Promise<void>=>{
 try{
  const [[total]]:any=await pool.query('SELECT COUNT(*) total FROM audit_logs');
  const [recent]:any=await pool.query('SELECT action,COUNT(*) count FROM audit_logs GROUP BY action ORDER BY count DESC LIMIT 8');
  const [[today]]:any=await pool.query('SELECT COUNT(*) total FROM audit_logs WHERE created_at>=CURDATE()');
  res.json({total:total.total,today:today.total,topActions:recent});
 }catch{res.status(500).json({message:'Unable to load audit summary.'});}
};