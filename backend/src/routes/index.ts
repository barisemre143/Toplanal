import { Router } from 'express';
import authRoutes from './auth';
import productRoutes from './products';
import cartRoutes from './cart';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

export default router;