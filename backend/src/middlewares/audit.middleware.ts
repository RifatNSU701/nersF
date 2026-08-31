import { Response, NextFunction } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../interfaces/request.interface';

const redact=(body:any)=>{
 const safe={...(body||{})};
 ['password','passwordHash','token','refreshToken','authorization'].forEach(k=>{if(k in safe)safe[k]='[REDACTED]';});
 return safe;
};

export const logAudit=(action:string,entity:string)=>{
 return (req:AuthRequest,res:Response,next:NextFunction)=>{
  res.on('finish',async()=>{
   if(res.statusCode<200||res.statusCode>=400)return;
   try{
    const ip=(req.headers['x-forwarded-for'] as string)?.split(',')[0].trim()||req.ip||req.socket.remoteAddress||null;
    await pool.execute('INSERT INTO audit_logs (user_id,action,entity,entity_id,details,ip_address) VALUES (?,?,?,?,?,?)',[req.user?.id||null,action,entity,req.params.id||req.params.tenderId||req.params.ticketId||null,JSON.stringify({method:req.method,path:req.originalUrl,body:redact(req.body),statusCode:res.statusCode}),ip]);
   }catch(error){console.error('[AUDIT] Failed to write audit event:',error);}
  });
  next();
 };
};