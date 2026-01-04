-- Row Level Security Policies for POS Kasir

-- Enable RLS on all tables
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

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Store Settings: All authenticated users can read
CREATE POLICY "All users can view store settings" ON store_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update store settings" ON store_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- Categories: All authenticated users can read, only admin/owner can modify
CREATE POLICY "All users can view categories" ON categories
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- Products: All authenticated users can read, only admin/owner can modify
CREATE POLICY "All users can view products" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- Customers: All authenticated users can read and create, admins can modify
CREATE POLICY "All users can view customers" ON customers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "All users can create customers" ON customers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update customers" ON customers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- Discounts: All authenticated users can read, only admin/owner can modify
CREATE POLICY "All users can view discounts" ON discounts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage discounts" ON discounts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- Shifts: Users can manage own shifts, admins can see all
CREATE POLICY "Users can view own shifts" ON shifts
    FOR SELECT USING (
        cashier_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

CREATE POLICY "Users can create own shifts" ON shifts
    FOR INSERT WITH CHECK (cashier_id = auth.uid());

CREATE POLICY "Users can update own shifts" ON shifts
    FOR UPDATE USING (cashier_id = auth.uid());

-- Transactions: Users can manage own transactions, admins can see all
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (
        cashier_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

CREATE POLICY "Users can create own transactions" ON transactions
    FOR INSERT WITH CHECK (cashier_id = auth.uid());

CREATE POLICY "Only admins can void transactions" ON transactions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- Transaction Items: Inherit from transactions
CREATE POLICY "Users can view transaction items" ON transaction_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM transactions t
            WHERE t.id = transaction_id AND (
                t.cashier_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'owner')
                )
            )
        )
    );

CREATE POLICY "Users can create transaction items" ON transaction_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM transactions t
            WHERE t.id = transaction_id AND t.cashier_id = auth.uid()
        )
    );

-- Stock Adjustments: All authenticated users can read, only admin/owner can create
CREATE POLICY "All users can view stock adjustments" ON stock_adjustments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can create stock adjustments" ON stock_adjustments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- Activity Logs: All authenticated users can create, admins can view all
CREATE POLICY "Users can view own activity logs" ON activity_logs
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

CREATE POLICY "All users can create activity logs" ON activity_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications: All authenticated users can read and update
CREATE POLICY "All users can view notifications" ON notifications
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "All users can update notifications" ON notifications
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can create notifications" ON notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );
