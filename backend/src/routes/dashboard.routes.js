import { Router } from 'express';
import { getSummary, getTopProducts } from '../controllers/dashboard.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAdmin);

router.get('/summary', getSummary);
router.get('/top-products', getTopProducts);

export default router;
