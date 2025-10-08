import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
} from '@mui/material';
import { ProductWithCart } from '../types';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: ProductWithCart;
  onAddToCart?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Sepete eklemek için giriş yapmalısınız');
      return;
    }

    try {
      setLoading(true);
      await apiService.addToCart(product.product_id, quantity);
      toast.success('Ürün sepete eklendi!');
      setOpen(false);
      setQuantity(1);
      if (onAddToCart) onAddToCart();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Sepete eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = product.progress_percentage || 0;
  const isCompleted = product.cart_status === 'completed';

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.image_url || '/placeholder-image.jpg'}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {product.description}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Normal Fiyat: <s>₺{product.regular_price.toLocaleString()}</s>
            </Typography>
            <Typography variant="h6" color="primary">
              Toptan Fiyat: ₺{product.wholesale_price.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Minimum Sipariş: {product.minimum_order_quantity} adet
            </Typography>
          </Box>

          {product.cart_id && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  İlerleme: {product.current_quantity}/{product.target_quantity}
                </Typography>
                <Typography variant="body2">
                  %{progressPercentage.toFixed(1)}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(progressPercentage, 100)}
                sx={{ mb: 1 }}
              />
              {isCompleted ? (
                <Chip 
                  label="Toptan fiyat aktif!" 
                  color="success" 
                  size="small" 
                />
              ) : (
                <Chip 
                  label="Sepet oluşturuluyor" 
                  color="primary" 
                  size="small" 
                />
              )}
            </Box>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={() => setOpen(true)}
            disabled={loading}
          >
            Sepete Ekle
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Sepete Ekle</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {isCompleted ? 'Toptan Fiyat' : 'Normal Fiyat'}: ₺
            {(isCompleted ? product.wholesale_price : product.regular_price).toLocaleString()}
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="Miktar"
            type="number"
            fullWidth
            variant="outlined"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1 }}
          />
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Toplam: ₺{((isCompleted ? product.wholesale_price : product.regular_price) * quantity).toLocaleString()}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>İptal</Button>
          <Button onClick={handleAddToCart} disabled={loading}>
            Sepete Ekle
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCard;