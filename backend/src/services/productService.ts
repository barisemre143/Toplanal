import pool from '../config/database';
import { Product, Category } from '../types';

export class ProductService {
  static async getAllProducts(categoryId?: number, search?: string): Promise<Product[]> {
    const client = await pool.connect();
    try {
      let query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        JOIN categories c ON p.category_id = c.category_id 
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (categoryId) {
        query += ` AND p.category_id = $${paramIndex}`;
        params.push(categoryId);
        paramIndex++;
      }

      if (search) {
        query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      query += ' ORDER BY p.created_at DESC';

      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async getProductById(productId: number): Promise<Product | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT p.*, c.name as category_name 
         FROM products p 
         JOIN categories c ON p.category_id = c.category_id 
         WHERE p.product_id = $1`,
        [productId]
      );

      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async getAllCategories(): Promise<Category[]> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM categories ORDER BY name');
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async getProductsWithActiveCarts(): Promise<any[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          p.*,
          sc.cart_id,
          sc.current_quantity,
          sc.target_quantity,
          sc.status as cart_status,
          sc.expires_at,
          ROUND((sc.current_quantity::decimal / sc.target_quantity::decimal) * 100, 2) as progress_percentage
        FROM products p
        JOIN shared_carts sc ON p.product_id = sc.product_id
        WHERE sc.status = 'active'
        ORDER BY sc.created_at DESC
      `);

      return result.rows;
    } finally {
      client.release();
    }
  }
}