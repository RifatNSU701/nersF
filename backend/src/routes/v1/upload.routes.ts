import { Router } from 'express';
import { uploadFile } from '../../controllers/upload.controller';
import { upload } from '../../middlewares/upload.middleware'; 
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// =======================
// UPLOAD ROUTE
// =======================
// POST /api/v1/upload
router.post('/', authenticate, upload.single('file'), uploadFile);

export default router;