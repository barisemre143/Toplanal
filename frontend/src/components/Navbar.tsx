import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
} from '@mui/material';
import {
  ShoppingCart,
  Person,
  Logout,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Toptan E-Ticaret
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" onClick={() => navigate('/')}>
            Ana Sayfa
          </Button>
          <Button color="inherit" onClick={() => navigate('/products')}>
            Ürünler
          </Button>
          <Button color="inherit" onClick={() => navigate('/active-carts')}>
            Aktif Sepetler
          </Button>

          {user ? (
            <>
              <IconButton color="inherit" onClick={() => navigate('/my-carts')}>
                <Badge color="secondary">
                  <ShoppingCart />
                </Badge>
              </IconButton>
              
              <Button
                color="inherit"
                startIcon={<Person />}
                onClick={() => navigate('/profile')}
              >
                {user.first_name}
              </Button>
              
              <IconButton color="inherit" onClick={handleLogout}>
                <Logout />
              </IconButton>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Giriş Yap
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Kayıt Ol
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;