import { Request, Response } from 'express';
import { CartService } from '../services/cartService';
import { ApiResponse } from '../types';

export class CartController {
  static async addToCart(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { product_id, quantity } = req.body;
      const userId = req.user.user_id;

      const result = await CartService.addToCart(userId, product_id, quantity);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Product added to cart successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add product to cart'
      };
      res.status(400).json(response);
    }
  }

  static async getUserCarts(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const carts = await CartService.getUserCarts(req.user.user_id);

      const response: ApiResponse = {
        success: true,
        data: carts
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch user carts'
      };
      res.status(500).json(response);
    }
  }

  static async getCartDetails(req: Request, res: Response) {
    try {
      const cartId = parseInt(req.params.cartId);
      const cart = await CartService.getCartDetails(cartId);

      if (!cart) {
        return res.status(404).json({
          success: false,
          error: 'Cart not found'
        });
      }

      const response: ApiResponse = {
        success: true,
        data: cart
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch cart details'
      };
      res.status(500).json(response);
    }
  }

  static async removeFromCart(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const cartId = parseInt(req.params.cartId);
      const userId = req.user.user_id;

      await CartService.removeFromCart(userId, cartId);

      const response: ApiResponse = {
        success: true,
        message: 'Removed from cart successfully'
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove from cart'
      };
      res.status(400).json(response);
    }
  }
}