-- SUPABASE SETUP SCRIPT - RUN SEKALI SAJA
-- Script ini aman dijalankan berulang kali (idempotent)

-- 1. Drop existing tables if any (clean slate)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS stock_adjustments CASCADE;
DROP TABLE IF EXISTS transaction_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS discounts CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS store_settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Create all tables
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'kasir', 'owner')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    logo_url TEXT,
    receipt_footer TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    barcode TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    price NUMERIC(12,2) NOT NULL,
    cost_price NUMERIC(12,2),
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    points INTEGER NOT NULL DEFAULT 0,
    total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
    visit_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value NUMERIC(12,2) NOT NULL,
    min_purchase NUMERIC(12,2),
    max_discount NUMERIC(12,2),
    usage_limit INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cashier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    cashier_name TEXT NOT NULL,
    opening_cash NUMERIC(12,2) NOT NULL,
    closing_cash NUMERIC(12,2),
    expected_cash NUMERIC(12,2),
    difference NUMERIC(12,2),
    total_sales NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_transactions INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('open', 'closed')),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    notes TEXT
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number TEXT NOT NULL UNIQUE,
    cashier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    discount NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_code TEXT,
    total NUMERIC(12,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'qris', 'transfer', 'other')),
    payment_amount NUMERIC(12,2) NOT NULL,
    change_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('completed', 'voided', 'pending')),
    notes TEXT,
    synced BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    quantity INTEGER NOT NULL,
    discount NUMERIC(12,2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(12,2) NOT NULL
);

CREATE TABLE stock_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('in', 'out', 'opname')),
    quantity INTEGER NOT NULL,
    stock_before INTEGER NOT NULL,
    stock_after INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    description TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    entity_name TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('low_stock', 'shift_reminder', 'promo', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_discounts_code ON discounts(code);
CREATE INDEX idx_discounts_active ON discounts(is_active);
CREATE INDEX idx_shifts_cashier ON shifts(cashier_id);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_transactions_number ON transactions(transaction_number);
CREATE INDEX idx_transactions_cashier ON transactions(cashier_id);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX idx_stock_adjustments_product ON stock_adjustments(product_id);
CREATE INDEX idx_stock_adjustments_created ON stock_adjustments(created_at);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- 5. Create triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON store_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies
-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Store Settings
CREATE POLICY "All users can view store settings" ON store_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can update store settings" ON store_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

-- Categories
CREATE POLICY "All users can view categories" ON categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can manage categories" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

-- Products
CREATE POLICY "All users can view products" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can manage products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

-- Customers
CREATE POLICY "All users can view customers" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "All users can create customers" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only admins can update customers" ON customers FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

-- Discounts
CREATE POLICY "All users can view discounts" ON discounts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can manage discounts" ON discounts FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

-- Shifts
CREATE POLICY "Users can view own shifts" ON shifts FOR SELECT USING (
    cashier_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);
CREATE POLICY "Users can create own shifts" ON shifts FOR INSERT WITH CHECK (cashier_id = auth.uid());
CREATE POLICY "Users can update own shifts" ON shifts FOR UPDATE USING (cashier_id = auth.uid());

-- Transactions
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (
    cashier_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);
CREATE POLICY "Users can create own transactions" ON transactions FOR INSERT WITH CHECK (cashier_id = auth.uid());
CREATE POLICY "Only admins can void transactions" ON transactions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

-- Transaction Items
CREATE POLICY "Users can view transaction items" ON transaction_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM transactions t WHERE t.id = transaction_id AND (
            t.cashier_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
        )
    )
);
CREATE POLICY "Users can create transaction items" ON transaction_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_id AND t.cashier_id = auth.uid())
);

-- Stock Adjustments
CREATE POLICY "All users can view stock adjustments" ON stock_adjustments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can create stock adjustments" ON stock_adjustments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

-- Activity Logs
CREATE POLICY "Users can view own activity logs" ON activity_logs FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);
CREATE POLICY "All users can create activity logs" ON activity_logs FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications
CREATE POLICY "All users can view notifications" ON notifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "All users can update notifications" ON notifications FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can create notifications" ON notifications FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

-- 8. Create profile for existing users (if any)
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id, email FROM auth.users
    LOOP
        INSERT INTO profiles (id, full_name, role)
        VALUES (user_record.id, COALESCE(user_record.email, 'User'), 'admin')
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- Done!
SELECT 'Supabase setup complete! ✅' as status;
