import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { CartWithProduct } from '../types';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const MyCarts: React.FC = () => {
  const { user } = useAuth();
  const [carts, setCarts] = useState<CartWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCart, setSelectedCart] = useState<CartWithProduct | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadCarts();
    }
  }, [user]);

  const loadCarts = async () => {
    try {
      setLoading(true);
      const cartsData = await apiService.getUserCarts();
      setCarts(cartsData);
    } catch (error) {
      console.error('Error loading carts:', error);
      toast.error('Sepetler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (cartId: number) => {
    try {
      await apiService.removeFromCart(cartId);
      toast.success('Sepetten çıkarıldı');
      loadCarts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Hata oluştu');
    }
  };

  const handleViewDetails = async (cart: CartWithProduct) => {
    try {
      const details = await apiService.getCartDetails(cart.cart_id);
      setSelectedCart(details);
      setDetailsOpen(true);
    } catch (error) {
      toast.error('Detaylar yüklenirken hata oluştu');
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" textAlign="center">
          Sepetlerinizi görmek için giriş yapmalısınız
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Sepetlerim
      </Typography>

      {carts.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          Henüz sepetinizde ürün bulunmuyor.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {carts.map((cart) => (
            <Grid item xs={12} md={6} key={cart.cart_id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={cart.image_url || '/placeholder-image.jpg'}
                  alt={cart.product_name}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {cart.product_name}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Benim Miktarım: {cart.user_quantity} adet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Normal Fiyat: ₺{cart.regular_price.toLocaleString()}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      Toptan Fiyat: ₺{cart.wholesale_price.toLocaleString()}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        İlerleme: {cart.current_quantity}/{cart.target_quantity}
                      </Typography>
                      <Typography variant="body2">
                        %{cart.progress_percentage.toFixed(1)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(cart.progress_percentage, 100)}
                      sx={{ mb: 1 }}
                    />
                    
                    {cart.status === 'completed' ? (
                      <Chip label="Toptan fiyat aktif!" color="success" size="small" />
                    ) : cart.status === 'active' ? (
                      <Chip label="Beklemede" color="primary" size="small" />
                    ) : (
                      <Chip label="Süresi dolmuş" color="error" size="small" />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewDetails(cart)}
                    >
                      Detaylar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleRemoveFromCart(cart.cart_id)}
                    >
                      Çıkar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Cart Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Sepet Detayları</DialogTitle>
        <DialogContent>
          {selectedCart && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedCart.product?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                İlerleme: {selectedCart.current_quantity}/{selectedCart.target_quantity} adet
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Katılımcılar ({selectedCart.participant_count}):
              </Typography>
              
              <List dense>
                {selectedCart.participants?.map((participant, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${participant.first_name} ${participant.last_name}`}
                      secondary={`${participant.quantity} adet - ${new Date(participant.added_at).toLocaleDateString('tr-TR')}`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyCarts;