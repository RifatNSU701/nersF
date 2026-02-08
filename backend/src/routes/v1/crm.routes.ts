import { Router } from 'express';
import { 
  createComplaint, 
  getMyComplaints, 
  getAllComplaints, 
  resolveComplaint, 
  submitFeedback 
} from '../../controllers/crm.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// =======================
// 1. COMPLAINT ROUTES
// =======================

// User: Submit a new complaint
router.post('/complaints', authenticate, createComplaint);

// User: Get their own history
router.get('/complaints', authenticate, getMyComplaints);

// Admin: Get ALL complaints from everyone
router.get('/complaints/all', authenticate, getAllComplaints);

// Admin: Resolve/Reply to a complaint
router.put('/complaints/:id', authenticate, resolveComplaint);

// =======================
// 2. FEEDBACK ROUTES
// =======================

// Public: Submit feedback (Rating 1-5)
router.post('/feedback', submitFeedback);

export default router;