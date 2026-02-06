import { Router } from 'express';
import { createRequisition, approveRequisition, getAllRequisitions } from '../../controllers/requisition.controller';

const router = Router();

// GET http://localhost:5000/api/requisitions
router.get('/', getAllRequisitions);

// POST http://localhost:5000/api/requisitions
router.post('/', createRequisition);

// PUT http://localhost:5000/api/requisitions/:id/approve
router.put('/:id/approve', approveRequisition);

export default router;