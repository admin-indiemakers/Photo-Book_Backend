import { Router } from 'express';
import multer from 'multer';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  calculateQuote
} from '../controllers/products.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

router.use(requireAdmin);

router.post('/calculate-quote', calculateQuote);

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/upload-image', upload.single('image'), uploadProductImage);

export default router;
