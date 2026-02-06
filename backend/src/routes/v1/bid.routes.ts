import { Router } from 'express';
// Notice we import functions directly, NOT "BidController"
import { submitBid, getBidsByTender } from '../../controllers/bid.controller'; 
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { UserRoles } from '../../constants/roles';

const router = Router();

router.post('/', authenticate, authorize([UserRoles.VENDOR]), submitBid);
router.get('/:tenderId', authenticate, authorize([UserRoles.ADMIN]), getBidsByTender);

export default router;