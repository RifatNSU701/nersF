import { Router } from 'express';
import { 
    createWarehouse, 
    getAllWarehouses, 
    createCommodity, 
    getCommodities, 
    addStock, 
    getStockByWarehouse 
} from '../../controllers/storage.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { UserRoles } from '../../constants/roles';
import { getLiveRates } from '../../controllers/public.controller';

const router = Router();

// =======================
// WAREHOUSES
// =======================
router.post('/warehouses', authenticate, authorize([UserRoles.ADMIN]), createWarehouse);
router.get('/warehouses', authenticate, getAllWarehouses);

// =======================
// COMMODITIES (Master List)
// =======================
// Only Admin creates commodities (e.g., defines what "Rice" is)
router.post('/commodities', authenticate, authorize([UserRoles.ADMIN]), createCommodity);
router.get('/commodities', authenticate, getCommodities);

// =======================
// STOCKS (Inventory)
// =======================
// Adding stock is a critical action (Admin or Vendor with permission)
router.post('/stocks', authenticate, authorize([UserRoles.ADMIN, UserRoles.VENDOR]), addStock);

// Get stock for a specific warehouse
router.get('/stocks/:warehouseId', authenticate, getStockByWarehouse);
router.get('/rates', getLiveRates);

export default router;