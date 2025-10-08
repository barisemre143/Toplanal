-- E-Commerce Toptan Alım Sistemi Database Schema
-- PostgreSQL

-- Enum Types
CREATE TYPE cart_status AS ENUM ('active', 'completed', 'expired');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');

-- 1. USERS Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATEGORIES Table (Hierarchical)
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_category_id INTEGER REFERENCES categories(category_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUCTS Table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL REFERENCES categories(category_id),
    regular_price DECIMAL(10,2) NOT NULL,
    wholesale_price DECIMAL(10,2) NOT NULL,
    minimum_order_quantity INTEGER NOT NULL DEFAULT 1,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT price_check CHECK (wholesale_price < regular_price),
    CONSTRAINT quantity_check CHECK (minimum_order_quantity > 0 AND stock_quantity >= 0)
);

-- 4. ADDRESSES Table
CREATE TABLE addresses (
    address_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(50) NOT NULL,
    full_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. SHARED_CARTS Table
CREATE TABLE shared_carts (
    cart_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    current_quantity INTEGER DEFAULT 0,
    target_quantity INTEGER NOT NULL,
    status cart_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    CONSTRAINT target_quantity_check CHECK (target_quantity > 0),
    CONSTRAINT current_quantity_check CHECK (current_quantity >= 0)
);

-- 6. CART_PARTICIPANTS Table
CREATE TABLE cart_participants (
    participant_id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL REFERENCES shared_carts(cart_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT quantity_positive CHECK (quantity > 0),
    CONSTRAINT unique_user_cart UNIQUE (cart_id, user_id)
);

-- 7. ORDERS Table
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    total_amount DECIMAL(10,2) NOT NULL,
    status order_status DEFAULT 'pending',
    shipping_address_id INTEGER NOT NULL REFERENCES addresses(address_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT total_amount_positive CHECK (total_amount > 0)
);

-- 8. ORDER_ITEMS Table
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    
    CONSTRAINT quantity_positive CHECK (quantity > 0),
    CONSTRAINT unit_price_positive CHECK (unit_price > 0)
);

-- Performance Indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_shared_carts_product ON shared_carts(product_id);
CREATE INDEX idx_shared_carts_status ON shared_carts(status);
CREATE INDEX idx_cart_participants_cart ON cart_participants(cart_id);
CREATE INDEX idx_cart_participants_user ON cart_participants(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update current_quantity in shared_carts
CREATE OR REPLACE FUNCTION update_shared_cart_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE shared_carts 
        SET current_quantity = current_quantity + NEW.quantity 
        WHERE cart_id = NEW.cart_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE shared_carts 
        SET current_quantity = current_quantity - OLD.quantity + NEW.quantity 
        WHERE cart_id = NEW.cart_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE shared_carts 
        SET current_quantity = current_quantity - OLD.quantity 
        WHERE cart_id = OLD.cart_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cart_quantity
    AFTER INSERT OR UPDATE OR DELETE ON cart_participants
    FOR EACH ROW EXECUTE FUNCTION update_shared_cart_quantity();

-- Sample Data
INSERT INTO categories (name, description) VALUES 
('Elektronik', 'Elektronik ürünler'),
('Giyim', 'Giyim ve aksesuar'),
('Ev & Yaşam', 'Ev eşyaları ve dekorasyon');

INSERT INTO products (name, description, category_id, regular_price, wholesale_price, minimum_order_quantity, stock_quantity, image_url) VALUES
('iPhone 15', 'Apple iPhone 15 128GB', 1, 35000.00, 32000.00, 10, 100, 'https://example.com/iphone15.jpg'),
('Samsung Galaxy S24', 'Samsung Galaxy S24 256GB', 1, 30000.00, 27000.00, 15, 80, 'https://example.com/galaxy-s24.jpg'),
('Nike Air Max', 'Nike Air Max spor ayakkabı', 2, 3500.00, 3000.00, 20, 200, 'https://example.com/nike-airmax.jpg'),
('Dyson V15', 'Dyson V15 Detect Süpürge', 3, 8000.00, 7200.00, 5, 50, 'https://example.com/dyson-v15.jpg');