import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Product, Category } from '../types';
import apiService from '../services/api';
import ProductCard from '../components/ProductCard';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadProducts();
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [search, selectedCategory]);

  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await apiService.getProducts(
        selectedCategory || undefined,
        search || undefined
      );
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Ürünler
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Ürün ara..."
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={selectedCategory}
                label="Kategori"
                onChange={(e) => setSelectedCategory(e.target.value as number | '')}
              >
                <MenuItem value="">Tüm Kategoriler</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.category_id} value={category.category_id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Products Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : products.length > 0 ? (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.product_id}>
              <ProductCard product={product} onAddToCart={loadProducts} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          Ürün bulunamadı.
        </Typography>
      )}
    </Container>
  );
};

export default Products;