import { Router } from 'express';
import { createTender, getAllTenders } from '../../controllers/tender.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { UserRoles } from '../../constants/roles';
import { upload } from '../../utils/upload';

const router = Router();

// =======================
// PRODUCTION TENDER ROUTES
// =======================

router.post(
  '/', 
  
  // 1. UPLOAD FIRST (Crucial: Must be before Auth)
  upload.single('tender_doc'),

  // 2. DEBUG LOG (Keep this for safety for now)
  (req, res, next) => {
      // If Multer failed, we stop here
      if (!req.file) {
          console.log('❌ Error: No file uploaded');
          // Optional: You can return an error here if file is mandatory
          // return res.status(400).json({ message: 'File is required' });
      } else {
          console.log('✅ File Uploaded:', req.file.filename);
      }
      next();
  },

  // 3. SECURITY (Now it is safe to run)
  authenticate, 
  authorize([UserRoles.ADMIN]), 
  
  // 4. CONTROLLER (Final Logic)
  createTender
);

router.get('/', getAllTenders);

export default router;