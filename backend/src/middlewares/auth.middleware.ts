import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../interfaces/request.interface';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // 1. Get Token from Header (Format: "Bearer <token>")
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Access Denied: No Token Provided' });
    return;
  }

  // 2. Extract the actual token string
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify Token
    const secret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(token, secret) as { id: string; role: any };

    // 4. Attach User to Request (So Controllers can use it)
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    // 5. Allow access
    next();

  } catch (error) {
    res.status(403).json({ message: 'Invalid or Expired Token' });
  }
};