import { Router, Request, Response } from 'express';
// FIX 1: Import individual functions, NOT 'AuthController'
import { register, login, getCurrentUser } from '../../controllers/auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
// FIX 2: Import the UserRoles Enum
import { UserRoles } from '../../constants/roles';

// Interface for Request with User (Optional, but helps TypeScript)
interface AuthRequest extends Request {
  user?: any;
}

const router = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.post('/register', register);
router.post('/login', login);

// ==========================================
// PROTECTED ROUTES
// ==========================================

// 1. Get Current User (Any Logged-in User)
// Note: We use 'getCurrentUser' which matches your controller export
router.get('/me', authenticate, getCurrentUser);

// 2. Admin Test Route (Only Admins)
// FIX 3: Use UserRoles.ADMIN to satisfy strict typing
router.get('/admin', authenticate, authorize([UserRoles.ADMIN]), (req: AuthRequest, res: Response) => {
  res.status(200).json({ 
    message: "Welcome, Administrator.",
    user: req.user 
  });
});

export default router;