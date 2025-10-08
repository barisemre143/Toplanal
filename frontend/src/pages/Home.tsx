import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ProductWithCart } from '../types';
import apiService from '../services/api';
import ProductCard from '../components/ProductCard';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithCart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const products = await apiService.getProductsWithActiveCarts();
      setFeaturedProducts(products.slice(0, 6));
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Toptan Alım Sistemi
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Birlikte alın, toptan fiyattan yararlanın!
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  1. Ürün Seçin
                </Typography>
                <Typography variant="body2">
                  İstediğiniz ürünü bulun ve ortak sepete ekleyin
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  2. Diğerlerini Bekleyin
                </Typography>
                <Typography variant="body2">
                  Minimum sipariş adedine ulaşana kadar bekleyin
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  3. Toptan Fiyattan Alın
                </Typography>
                <Typography variant="body2">
                  Hedef adede ulaştığında toptan fiyattan satın alın
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/products')}
          >
            Ürünleri İncele
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/active-carts')}
          >
            Aktif Sepetler
          </Button>
        </Box>
      </Box>

      {/* Featured Products */}
      <Typography variant="h4" component="h2" gutterBottom>
        Öne Çıkan Ürünler
      </Typography>
      
      {loading ? (
        <Typography>Yükleniyor...</Typography>
      ) : featuredProducts.length > 0 ? (
        <Grid container spacing={3}>
          {featuredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.product_id}>
              <ProductCard product={product} onAddToCart={loadFeaturedProducts} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary">
          Henüz aktif sepet bulunamadı.
        </Typography>
      )}
    </Container>
  );
};

export default Home;