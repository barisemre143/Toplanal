import pool from '../config/database';
import { SharedCart, CartParticipant, CartWithProduct } from '../types';

export class CartService {
  static async addToCart(userId: number, productId: number, quantity: number): Promise<{ cart_id: number; participant_id: number }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const product = await client.query('SELECT * FROM products WHERE product_id = $1', [productId]);
      if (product.rows.length === 0) {
        throw new Error('Product not found');
      }

      let activeCart = await client.query(
        'SELECT * FROM shared_carts WHERE product_id = $1 AND status = $2',
        [productId, 'active']
      );

      let cartId: number;

      if (activeCart.rows.length === 0) {
        const newCart = await client.query(
          `INSERT INTO shared_carts (product_id, target_quantity, expires_at) 
           VALUES ($1, $2, $3) 
           RETURNING cart_id`,
          [productId, product.rows[0].minimum_order_quantity, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        );
        cartId = newCart.rows[0].cart_id;
      } else {
        cartId = activeCart.rows[0].cart_id;
      }

      const existingParticipant = await client.query(
        'SELECT * FROM cart_participants WHERE cart_id = $1 AND user_id = $2',
        [cartId, userId]
      );

      let participantId: number;

      if (existingParticipant.rows.length > 0) {
        const updatedParticipant = await client.query(
          'UPDATE cart_participants SET quantity = quantity + $1 WHERE cart_id = $2 AND user_id = $3 RETURNING participant_id',
          [quantity, cartId, userId]
        );
        participantId = updatedParticipant.rows[0].participant_id;
      } else {
        const newParticipant = await client.query(
          'INSERT INTO cart_participants (cart_id, user_id, quantity) VALUES ($1, $2, $3) RETURNING participant_id',
          [cartId, userId, quantity]
        );
        participantId = newParticipant.rows[0].participant_id;
      }

      const updatedCart = await client.query(
        'SELECT * FROM shared_carts WHERE cart_id = $1',
        [cartId]
      );

      if (updatedCart.rows[0].current_quantity >= updatedCart.rows[0].target_quantity) {
        await client.query(
          'UPDATE shared_carts SET status = $1 WHERE cart_id = $2',
          ['completed', cartId]
        );
      }

      await client.query('COMMIT');
      return { cart_id: cartId, participant_id: participantId };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getUserCarts(userId: number): Promise<CartWithProduct[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          sc.*,
          p.name as product_name,
          p.description as product_description,
          p.regular_price,
          p.wholesale_price,
          p.image_url,
          cp.quantity as user_quantity,
          cp.added_at as user_added_at,
          ROUND((sc.current_quantity::decimal / sc.target_quantity::decimal) * 100, 2) as progress_percentage
        FROM shared_carts sc
        JOIN products p ON sc.product_id = p.product_id
        JOIN cart_participants cp ON sc.cart_id = cp.cart_id
        WHERE cp.user_id = $1
        ORDER BY cp.added_at DESC
      `, [userId]);

      return result.rows;
    } finally {
      client.release();
    }
  }

  static async getCartDetails(cartId: number): Promise<CartWithProduct | null> {
    const client = await pool.connect();
    try {
      const cartResult = await client.query(`
        SELECT 
          sc.*,
          p.name as product_name,
          p.description as product_description,
          p.regular_price,
          p.wholesale_price,
          p.image_url,
          ROUND((sc.current_quantity::decimal / sc.target_quantity::decimal) * 100, 2) as progress_percentage
        FROM shared_carts sc
        JOIN products p ON sc.product_id = p.product_id
        WHERE sc.cart_id = $1
      `, [cartId]);

      if (cartResult.rows.length === 0) {
        return null;
      }

      const participantsResult = await client.query(`
        SELECT 
          cp.user_id,
          cp.quantity,
          cp.added_at,
          u.first_name,
          u.last_name
        FROM cart_participants cp
        JOIN users u ON cp.user_id = u.user_id
        WHERE cp.cart_id = $1
        ORDER BY cp.added_at
      `, [cartId]);

      const cart = cartResult.rows[0];
      return {
        ...cart,
        product: {
          product_id: cart.product_id,
          name: cart.product_name,
          description: cart.product_description,
          regular_price: cart.regular_price,
          wholesale_price: cart.wholesale_price,
          image_url: cart.image_url
        },
        participant_count: participantsResult.rows.length,
        participants: participantsResult.rows
      } as CartWithProduct;
    } finally {
      client.release();
    }
  }

  static async removeFromCart(userId: number, cartId: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const participant = await client.query(
        'SELECT * FROM cart_participants WHERE cart_id = $1 AND user_id = $2',
        [cartId, userId]
      );

      if (participant.rows.length === 0) {
        throw new Error('Participant not found in cart');
      }

      await client.query(
        'DELETE FROM cart_participants WHERE cart_id = $1 AND user_id = $2',
        [cartId, userId]
      );

      const remainingParticipants = await client.query(
        'SELECT COUNT(*) as count FROM cart_participants WHERE cart_id = $1',
        [cartId]
      );

      if (parseInt(remainingParticipants.rows[0].count) === 0) {
        await client.query('DELETE FROM shared_carts WHERE cart_id = $1', [cartId]);
      } else {
        const cart = await client.query('SELECT * FROM shared_carts WHERE cart_id = $1', [cartId]);
        if (cart.rows[0].current_quantity < cart.rows[0].target_quantity) {
          await client.query(
            'UPDATE shared_carts SET status = $1 WHERE cart_id = $2',
            ['active', cartId]
          );
        }
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}