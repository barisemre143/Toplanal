import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, User, Product, Category, CartWithProduct, RegisterData } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = await this.api.post('/auth/login', {
      email,
      password,
    });
    return response.data.data!;
  }

  async register(userData: RegisterData): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = await this.api.post('/auth/register', userData);
    return response.data.data!;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/profile');
    return response.data.data!;
  }

  async getProducts(categoryId?: number, search?: string): Promise<Product[]> {
    const params = new URLSearchParams();
    if (categoryId) params.append('category_id', categoryId.toString());
    if (search) params.append('search', search);

    const response: AxiosResponse<ApiResponse<Product[]>> = await this.api.get(`/products?${params}`);
    return response.data.data!;
  }

  async getProduct(id: number): Promise<Product> {
    const response: AxiosResponse<ApiResponse<Product>> = await this.api.get(`/products/${id}`);
    return response.data.data!;
  }

  async getCategories(): Promise<Category[]> {
    const response: AxiosResponse<ApiResponse<Category[]>> = await this.api.get('/products/categories');
    return response.data.data!;
  }

  async getProductsWithActiveCarts(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/products/with-active-carts');
    return response.data.data!;
  }

  async addToCart(productId: number, quantity: number): Promise<{ cart_id: number; participant_id: number }> {
    const response: AxiosResponse<ApiResponse<{ cart_id: number; participant_id: number }>> = await this.api.post('/cart/add', {
      product_id: productId,
      quantity,
    });
    return response.data.data!;
  }

  async getUserCarts(): Promise<CartWithProduct[]> {
    const response: AxiosResponse<ApiResponse<CartWithProduct[]>> = await this.api.get('/cart/my-carts');
    return response.data.data!;
  }

  async getCartDetails(cartId: number): Promise<CartWithProduct> {
    const response: AxiosResponse<ApiResponse<CartWithProduct>> = await this.api.get(`/cart/${cartId}`);
    return response.data.data!;
  }

  async removeFromCart(cartId: number): Promise<void> {
    await this.api.delete(`/cart/${cartId}`);
  }
}

export default new ApiService();