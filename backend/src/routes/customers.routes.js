import { Router } from 'express';
import { listCustomers, getCustomer, updateCustomer } from '../controllers/customers.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAdmin);

router.get('/', listCustomers);
router.get('/:id', getCustomer);
router.patch('/:id', updateCustomer);

export default router;
