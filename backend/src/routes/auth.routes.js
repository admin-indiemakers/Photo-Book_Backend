import { Router } from 'express';
import { login, refresh, me, updateProfile, changePassword } from '../controllers/auth.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', requireAdmin, me);
router.patch('/profile', requireAdmin, updateProfile);
router.post('/change-password', requireAdmin, changePassword);

export default router;
