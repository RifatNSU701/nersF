import { Router } from 'express';
import { createComplaint, getMyComplaints, getAllComplaints, updateComplaint, submitFeedback } from '../../controllers/crm.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { UserRoles } from '../../constants/roles';
import { logAudit } from '../../middlewares/audit.middleware';

const router = Router();
const consumerRoles = [UserRoles.CITIZEN];
const governmentRoles = [UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.OFFICER, UserRoles.SUPPORT_AGENT];

router.post('/complaints', authenticate, authorize(consumerRoles), logAudit('CREATE_COMPLAINT','COMPLAINT'), createComplaint);
router.get('/complaints', authenticate, authorize(consumerRoles), getMyComplaints);
router.get('/complaints/all', authenticate, authorize([...governmentRoles, UserRoles.AUDITOR]), getAllComplaints);
router.put('/complaints/:id', authenticate, authorize(governmentRoles), logAudit('UPDATE_COMPLAINT','COMPLAINT'), updateComplaint);
router.post('/feedback', authenticate, submitFeedback);

export default router;