import { Response, NextFunction } from 'express';
import pool from '../config/database';
// We assume this interface exists since Auth is working. 
// If it fails, we can define it here.
import { AuthRequest } from '../interfaces/request.interface'; 

export const logAudit = (action: string, entity: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Capture the request start
    const startTime = Date.now();
    
    // 2. Let the request happen
    next(); 

    // 3. Log AFTER the request finishes (on 'finish' event)
    res.on('finish', async () => {
      // Only log successful actions (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const userId = req.user?.id || null;
          const ip = req.ip || req.socket.remoteAddress;
          const entityId = req.params.id || null;
          
          // Safety: Don't log passwords or huge bodies
          const safeBody = { ...req.body };
          delete safeBody.password;
          const details = JSON.stringify(safeBody); 

          await pool.execute(
            `INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, action, entity, entityId, details, ip]
          );
        } catch (error) {
          console.error('[AUDIT] Failed to log action:', error);
        }
      }
    });
  };
};