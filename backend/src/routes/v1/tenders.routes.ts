import { Router } from 'express';
import { createTender, getAllTenders, getTenderById, closeTender } from '../../controllers/tender.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { UserRoles } from '../../constants/roles';
import { logAudit } from '../../middlewares/audit.middleware';
import { upload } from '../../utils/upload';

const router = Router();

router.get('/', getAllTenders);
router.get('/:id', getTenderById);

router.post(
  '/',
  authenticate,
  authorize([UserRoles.ADMIN, UserRoles.TENDER_OFFICER]),
  upload.single('tender_doc'),
  logAudit('CREATE_TENDER','TENDER'),
  createTender
);

router.patch(
  '/:id/close',
  authenticate,
  authorize([UserRoles.ADMIN, UserRoles.TENDER_OFFICER]),
  logAudit('CLOSE_TENDER','TENDER'),
  closeTender
);

export default router;