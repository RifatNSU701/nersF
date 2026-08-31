import { Router } from 'express';
import { submitBid, getBidsByTender, getMyBids, evaluateBid, awardTender } from '../../controllers/bid.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { UserRoles } from '../../constants/roles';
import { logAudit } from '../../middlewares/audit.middleware';

const router = Router();
const procurementRoles = [UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.TENDER_OFFICER];

router.post('/', authenticate, authorize([UserRoles.VENDOR]), submitBid);
router.get('/my', authenticate, authorize([UserRoles.VENDOR]), getMyBids);
router.get('/:tenderId', authenticate, authorize([...procurementRoles, UserRoles.AUDITOR]), getBidsByTender);
router.patch('/:bidId/evaluate', authenticate, authorize(procurementRoles), evaluateBid);
router.post('/:tenderId/award/:bidId', authenticate, authorize(procurementRoles), awardTender);

export default router;