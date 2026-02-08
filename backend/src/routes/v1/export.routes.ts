import { Router } from 'express';
import { exportTableToCSV } from '../../controllers/export.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// GET /api/v1/export/:tableName
// Example: /api/v1/export/tenders
// Only ADMINs can download data
router.get('/:tableName', authenticate, authorize(['ADMIN']), exportTableToCSV);

export default router;