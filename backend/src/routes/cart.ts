import { Router } from 'express';
import { CartController } from '../controllers/cartController';
import { validateRequest, addToCartSchema } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/add', authenticateToken, validateRequest(addToCartSchema), CartController.addToCart);
router.get('/my-carts', authenticateToken, CartController.getUserCarts);
router.get('/:cartId', CartController.getCartDetails);
router.delete('/:cartId', authenticateToken, CartController.removeFromCart);

export default router;