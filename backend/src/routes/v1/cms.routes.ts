import { Router } from 'express';
import { getNews, createNews, getNotices, createNotice } from '../../controllers/cms.controller';
// Ensure this path matches where your auth middleware is located
import { authenticate } from '../../middlewares/auth.middleware'; 

const router = Router();

// =======================
// PUBLIC ROUTES (Read Only)
// =======================
router.get('/news', getNews);
router.get('/notices', getNotices);

// =======================
// PROTECTED ROUTES (Admin Only)
// =======================
// We add 'authenticate' so only logged-in users can post
router.post('/news', authenticate, createNews);
router.post('/notices', authenticate, createNotice);

export default router;