import { Router } from 'express';
import { listCarts } from '../controllers/carts.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAdmin);

router.get('/', listCarts);

export default router;
