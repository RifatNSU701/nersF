import { Router } from 'express';
import { 
  createTrade, getTrades, 
  addShipment, updateShipmentStatus, getActiveShipments 
} from '../../controllers/trade.controller';
// FIX: Ensure this matches your folder name 'middlewares' (Plural)
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// =======================
// TRADING ROUTES
// =======================
// Only Admin or "Logistics Manager" should access these
router.get('/', authenticate, getTrades); // View all contracts
router.post('/', authenticate, authorize(['ADMIN', 'OFFICER']), createTrade); // Create new contract

// =======================
// SHIPMENT ROUTES
// =======================
router.get('/shipments/active', authenticate, getActiveShipments); // Dashboard view
router.post('/shipments', authenticate, authorize(['ADMIN', 'OFFICER']), addShipment); // Schedule ship
router.put('/shipments/:id', authenticate, authorize(['ADMIN', 'OFFICER']), updateShipmentStatus); // Update GPS/Status

export default router;