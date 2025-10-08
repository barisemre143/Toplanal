export interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  product_id: number;
  name: string;
  description?: string;
  category_id: number;
  category_name?: string;
  regular_price: number;
  wholesale_price: number;
  minimum_order_quantity: number;
  stock_quantity: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  category_id: number;
  name: string;
  description?: string;
  parent_category_id?: number;
  created_at: string;
}

export interface SharedCart {
  cart_id: number;
  product_id: number;
  current_quantity: number;
  target_quantity: number;
  status: 'active' | 'completed' | 'expired';
  created_at: string;
  expires_at?: string;
  progress_percentage: number;
}

export interface CartWithProduct extends SharedCart {
  product_name: string;
  product_description?: string;
  regular_price: number;
  wholesale_price: number;
  image_url?: string;
  user_quantity?: number;
  user_added_at?: string;
  participant_count?: number;
  participants?: Array<{
    user_id: number;
    first_name: string;
    last_name: string;
    quantity: number;
    added_at: string;
  }>;
}

export interface ProductWithCart extends Product {
  cart_id?: number;
  current_quantity?: number;
  target_quantity?: number;
  cart_status?: string;
  expires_at?: string;
  progress_percentage?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}