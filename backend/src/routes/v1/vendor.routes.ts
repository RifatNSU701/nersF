import { Router } from 'express';
import { createVendorProfile } from '../../controllers/vendor.controller';
import { authenticate } from '../../middlewares/auth.middleware'; // Fixed path & name
import { authorize } from '../../middlewares/role.middleware';     // Fixed path & name
import { UserRoles } from '../../constants/roles';                 // Fixed Type issue

const router = Router();

// Route: POST /api/vendors/profile
// 1. Authenticate: Ensure user is logged in
// 2. Authorize: Ensure user has the role 'VENDOR' (using the Enum)
// 3. Controller: Run the profile creation logic
router.post(
  '/profile', 
  authenticate, 
  authorize([UserRoles.VENDOR]), 
  createVendorProfile
);

export default router;