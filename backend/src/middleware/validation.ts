import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  };
};

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  phone: Joi.string().optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const addToCartSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required()
});

export const createOrderSchema = Joi.object({
  cart_id: Joi.number().integer().positive().required(),
  shipping_address_id: Joi.number().integer().positive().required()
});

export const addressSchema = Joi.object({
  title: Joi.string().min(2).max(50).required(),
  full_address: Joi.string().min(10).required(),
  city: Joi.string().min(2).max(100).required(),
  postal_code: Joi.string().optional(),
  is_default: Joi.boolean().optional()
});