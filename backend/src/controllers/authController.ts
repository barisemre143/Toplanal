import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { ApiResponse } from '../types';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, first_name, last_name, phone } = req.body;
      
      const result = await AuthService.register({
        email,
        password,
        first_name,
        last_name,
        phone
      });

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'User registered successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
      res.status(400).json(response);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      const result = await AuthService.login(email, password);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Login successful'
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
      res.status(401).json(response);
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const user = await AuthService.getUserById(req.user.user_id);
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const response: ApiResponse = {
        success: true,
        data: user
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get profile'
      };
      res.status(500).json(response);
    }
  }
}