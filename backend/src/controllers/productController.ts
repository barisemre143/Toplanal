import { Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { ApiResponse } from '../types';

export class ProductController {
  static async getAllProducts(req: Request, res: Response) {
    try {
      const categoryId = req.query.category_id ? parseInt(req.query.category_id as string) : undefined;
      const search = req.query.search as string;

      const products = await ProductService.getAllProducts(categoryId, search);

      const response: ApiResponse = {
        success: true,
        data: products
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch products'
      };
      res.status(500).json(response);
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const productId = parseInt(req.params.id);
      const product = await ProductService.getProductById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      const response: ApiResponse = {
        success: true,
        data: product
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch product'
      };
      res.status(500).json(response);
    }
  }

  static async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await ProductService.getAllCategories();

      const response: ApiResponse = {
        success: true,
        data: categories
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch categories'
      };
      res.status(500).json(response);
    }
  }

  static async getProductsWithActiveCarts(req: Request, res: Response) {
    try {
      const products = await ProductService.getProductsWithActiveCarts();

      const response: ApiResponse = {
        success: true,
        data: products
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch products with active carts'
      };
      res.status(500).json(response);
    }
  }
}