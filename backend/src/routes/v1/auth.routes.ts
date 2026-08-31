import { Router, Request, Response } from 'express';
import { register, login, getCurrentUser } from '../../controllers/auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { UserRoles } from '../../constants/roles';

interface AuthRequest extends Request { user?: any; }

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);

router.get('/admin', authenticate, authorize([UserRoles.ADMIN]), (req: AuthRequest, res: Response) => {
  res.status(200).json({ message: 'Welcome, Administrator.', user: req.user });
});

export default router;