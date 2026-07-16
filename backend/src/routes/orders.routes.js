import { Router } from 'express';
import { listOrders, getOrder, updateOrderStatus, updateOrderNotes } from '../controllers/orders.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAdmin);

router.get('/', listOrders);
router.get('/:id', getOrder);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/notes', updateOrderNotes);

export default router;
