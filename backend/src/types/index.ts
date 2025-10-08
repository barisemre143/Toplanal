export interface User {
  user_id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  category_id: number;
  name: string;
  description?: string;
  parent_category_id?: number;
  created_at: Date;
}

export interface Product {
  product_id: number;
  name: string;
  description?: string;
  category_id: number;
  regular_price: number;
  wholesale_price: number;
  minimum_order_quantity: number;
  stock_quantity: number;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SharedCart {
  cart_id: number;
  product_id: number;
  current_quantity: number;
  target_quantity: number;
  status: 'active' | 'completed' | 'expired';
  created_at: Date;
  expires_at?: Date;
}

export interface CartParticipant {
  participant_id: number;
  cart_id: number;
  user_id: number;
  quantity: number;
  added_at: Date;
}

export interface Order {
  order_id: number;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface Address {
  address_id: number;
  user_id: number;
  title: string;
  full_address: string;
  city: string;
  postal_code?: string;
  is_default: boolean;
  created_at: Date;
}

export interface JWTPayload {
  user_id: number;
  email: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CartWithProduct extends SharedCart {
  product: Product;
  participant_count: number;
  participants: Array<{
    user_id: number;
    first_name: string;
    last_name: string;
    quantity: number;
  }>;
}