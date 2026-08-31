import { Router } from 'express';
import { submitBid, getBidsByTender, getMyBids } from '../../controllers/bid.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { UserRoles } from '../../constants/roles';

const router = Router();

router.post('/', authenticate, authorize([UserRoles.VENDOR]), submitBid);
router.get('/my', authenticate, authorize([UserRoles.VENDOR]), getMyBids);
router.get('/:tenderId', authenticate, authorize([UserRoles.ADMIN, UserRoles.TENDER_OFFICER, UserRoles.AUDITOR]), getBidsByTender);

export default router;