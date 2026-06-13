-- QRAZY Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Restaurants (Tenants)
CREATE TABLE restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id UUID REFERENCES auth.users(id) NOT NULL
);

-- 2. Menu Items
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  model_url TEXT, -- Cloudflare R2 URL for the 3D model
  spice_level INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL, -- Trust-based, no OTP
  status TEXT NOT NULL DEFAULT 'preparing', -- preparing, ready, delivered
  total_amount DECIMAL(10,2) NOT NULL,
  table_number INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Order Items
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INT NOT NULL DEFAULT 1,
  price_at_time DECIMAL(10,2) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Restaurants: Owners can only see and manage their own restaurants
CREATE POLICY "Owners can view own restaurant" ON restaurants
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners can update own restaurant" ON restaurants
  FOR UPDATE USING (auth.uid() = owner_id);

-- Menu Items: Public can view, only owners can edit
CREATE POLICY "Public can view menu items" ON menu_items
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage menu items" ON menu_items
  FOR ALL USING (
    auth.uid() IN (SELECT owner_id FROM restaurants WHERE id = restaurant_id)
  );

-- Orders: Owners can see their own restaurant's orders, public can create orders
CREATE POLICY "Public can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can view and update own orders" ON orders
  FOR ALL USING (
    auth.uid() IN (SELECT owner_id FROM restaurants WHERE id = restaurant_id)
  );

-- Order Items: Same as Orders
CREATE POLICY "Public can insert order items" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can view and update own order items" ON order_items
  FOR ALL USING (
    auth.uid() IN (
      SELECT r.owner_id 
      FROM orders o 
      JOIN restaurants r ON o.restaurant_id = r.id 
      WHERE o.id = order_id
    )
  );

-- Enable Realtime for the orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
