import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { UserRoles } from '../../constants/roles';
import { logAudit } from '../../middlewares/audit.middleware';
import { createTicket,getMyTickets,getSupportTickets,updateTicket,getMessages,postMessage } from '../../controllers/chat.controller';

const router=Router();
const agents=[UserRoles.ADMIN,UserRoles.SUPER_ADMIN,UserRoles.OFFICER,UserRoles.SUPPORT_AGENT];

router.post('/tickets',authenticate,createTicket);
router.get('/tickets/my',authenticate,getMyTickets);
router.get('/tickets',authenticate,authorize(agents),getSupportTickets);
router.patch('/tickets/:id',authenticate,authorize(agents),updateTicket);
router.get('/tickets/:ticketId/messages',authenticate,getMessages);
router.post('/tickets/:ticketId/messages',authenticate,postMessage);

export default router;