import { Request } from 'express';
import { UserRole } from './user.interface';

// We extend the standard Express Request to include our User Payload
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}