import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, ProductController.getAllProducts);
router.get('/categories', ProductController.getAllCategories);
router.get('/with-active-carts', ProductController.getProductsWithActiveCarts);
router.get('/:id', optionalAuth, ProductController.getProductById);

export default router;