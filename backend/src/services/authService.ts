import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { User, JWTPayload } from '../types';

export class AuthService {
  static async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const client = await pool.connect();
    try {
      const existingUser = await client.query('SELECT user_id FROM users WHERE email = $1', [userData.email]);
      if (existingUser.rows.length > 0) {
        throw new Error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const result = await client.query(
        `INSERT INTO users (email, password, first_name, last_name, phone) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING user_id, email, first_name, last_name, phone, created_at, updated_at`,
        [userData.email, hashedPassword, userData.first_name, userData.last_name, userData.phone]
      );

      const user = result.rows[0];
      const token = jwt.sign(
        { user_id: user.user_id, email: user.email } as JWTPayload,
        process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: '24h' }
      );

      return { user, token };
    } finally {
      client.release();
    }
  }

  static async login(email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign(
        { user_id: user.user_id, email: user.email } as JWTPayload,
        process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    } finally {
      client.release();
    }
  }

  static async getUserById(userId: number): Promise<Omit<User, 'password'> | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT user_id, email, first_name, last_name, phone, created_at, updated_at FROM users WHERE user_id = $1',
        [userId]
      );

      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }
}