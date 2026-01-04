// Database Types
export interface Profile {
    id: string
    full_name: string
    role: 'admin' | 'kasir' | 'owner'
    avatar_url?: string
    created_at: string
}

export interface StoreSettings {
    id: string
    name: string
    address?: string
    phone?: string
    logo_url?: string
    receipt_footer?: string
    updated_at: string
}

export interface Category {
    id: string
    name: string
    color: string
    sort_order: number
    created_at: string
}

export interface Product {
    id: string
    name: string
    barcode?: string
    category_id?: string
    price: number
    cost_price?: number
    stock: number
    min_stock: number
    image_url?: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Transaction {
    id: string
    transaction_number: string
    cashier_id: string
    customer_id?: string
    shift_id?: string
    subtotal: number
    discount: number
    discount_code?: string
    total: number
    payment_method: 'cash' | 'qris' | 'transfer' | 'other'
    payment_amount: number
    change_amount: number
    status: 'completed' | 'voided' | 'pending'
    notes?: string
    synced: boolean
    created_at: string
}

export interface TransactionItem {
    id: string
    transaction_id: string
    product_id: string
    product_name: string
    price: number
    quantity: number
    discount: number
    subtotal: number
}

export interface HeldTransaction {
    id: string
    cashier_id: string
    items: CartItem[]
    total: number
    note?: string
    created_at: string
}

// Cart Types
export interface CartItem {
    product_id: string
    product_name: string
    price: number
    quantity: number
    discount: number
    subtotal: number
    image_url?: string
}

// Sync Types
export interface SyncQueue {
    id?: number
    table: string
    action: 'insert' | 'update' | 'delete'
    data: Record<string, unknown>
    created_at: string
    retries: number
}

// API Response Types
export interface ApiResponse<T> {
    data: T | null
    error: string | null
}

// Auth Types
export interface AuthState {
    user: Profile | null
    isAuthenticated: boolean
    isLoading: boolean
}

// Store Types
export interface CartState {
    items: CartItem[]
    subtotal: number
    discount: number
    total: number
    addItem: (product: Product) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    updateItemDiscount: (productId: string, discount: number) => void
    setDiscount: (discount: number) => void
    clearCart: () => void
}

// Report Types
export interface DailySummary {
    date: string
    total_sales: number
    total_transactions: number
    total_items: number
}

export interface TopProduct {
    product_id: string
    product_name: string
    total_quantity: number
    total_sales: number
}

// Customer Types
export interface Customer {
    id: string
    name: string
    phone?: string
    email?: string
    address?: string
    points: number
    total_spent: number
    visit_count: number
    created_at: string
    updated_at: string
}

// Shift Types
export interface Shift {
    id: string
    cashier_id: string
    cashier_name: string
    opening_cash: number
    closing_cash?: number
    expected_cash?: number
    difference?: number
    total_sales: number
    total_transactions: number
    status: 'open' | 'closed'
    opened_at: string
    closed_at?: string
    notes?: string
}

// Stock Adjustment Types
export interface StockAdjustment {
    id: string
    product_id: string
    product_name: string
    adjustment_type: 'in' | 'out' | 'opname'
    quantity: number
    stock_before: number
    stock_after: number
    reason: string
    created_by: string
    created_at: string
}

// Discount/Promo Types
export interface Discount {
    id: string
    code: string
    name: string
    type: 'percentage' | 'fixed'
    value: number
    min_purchase?: number
    max_discount?: number
    usage_limit?: number
    used_count: number
    start_date?: string
    end_date?: string
    is_active: boolean
    created_at: string
}

// Notification Types
export interface AppNotification {
    id: string
    type: 'low_stock' | 'shift_reminder' | 'promo' | 'system'
    title: string
    message: string
    is_read: boolean
    data?: Record<string, unknown>
    created_at: string
}

