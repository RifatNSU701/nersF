import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { User } from '../interfaces/user.interface';
import dotenv from 'dotenv';

dotenv.config();

export const generateToken = (user: User): string => {
  // 1. Force the Secret to be a string
  const secret: Secret = process.env.JWT_SECRET || 'default_secret_do_not_use';

  // 2. Define Options
  const options: SignOptions = {
    // We cast to 'any' here to resolve the conflict between 'string' and 'StringValue'
    expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any, 
  };

  // 3. Sign the Token
  return jwt.sign(
    { id: user.id, role: user.role }, // Payload
    secret,
    options
  );
};