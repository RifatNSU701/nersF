import { Request, Response, NextFunction } from 'express';
import { UserRoles } from '../constants/roles';

// This extends the Express Request to include the user object
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authorize = (allowedRoles: UserRoles[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if the user's role is in the allowed list
    // We treat the string from the DB as a UserRole
    const userRole = authReq.user.role as UserRoles;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient Permissions' });
    }

    next();
  };
};