import Dexie, { type Table } from 'dexie'
import type {
    Product, Category, Transaction, TransactionItem,
    HeldTransaction, SyncQueue, StoreSettings, Profile,
    Customer, Shift, StockAdjustment, Discount, AppNotification
} from '@/types'

export class POSDatabase extends Dexie {
    products!: Table<Product, string>
    categories!: Table<Category, string>
    transactions!: Table<Transaction, string>
    transactionItems!: Table<TransactionItem, string>
    heldTransactions!: Table<HeldTransaction, string>
    syncQueue!: Table<SyncQueue, number>
    storeSettings!: Table<StoreSettings, string>
    profiles!: Table<Profile, string>
    customers!: Table<Customer, string>
    shifts!: Table<Shift, string>
    stockAdjustments!: Table<StockAdjustment, string>
    discounts!: Table<Discount, string>
    notifications!: Table<AppNotification, string>

    constructor() {
        super('POSKasirDB')

        this.version(2).stores({
            products: 'id, barcode, category_id, name, is_active',
            categories: 'id, name, sort_order',
            transactions: 'id, transaction_number, cashier_id, customer_id, shift_id, created_at, synced, status',
            transactionItems: 'id, transaction_id, product_id',
            heldTransactions: 'id, cashier_id, created_at',
            syncQueue: '++id, table, action, created_at',
            storeSettings: 'id',
            profiles: 'id, role',
            customers: 'id, phone, name',
            shifts: 'id, cashier_id, status, opened_at',
            stockAdjustments: 'id, product_id, created_at',
            discounts: 'id, code, is_active',
            notifications: 'id, type, is_read, created_at'
        })
    }
}

export const db = new POSDatabase()

// Helper functions
export async function clearAllData() {
    await db.products.clear()
    await db.categories.clear()
    await db.transactions.clear()
    await db.transactionItems.clear()
    await db.heldTransactions.clear()
    await db.syncQueue.clear()
    await db.customers.clear()
    await db.shifts.clear()
    await db.stockAdjustments.clear()
    await db.discounts.clear()
    await db.notifications.clear()
}

export async function getProductByBarcode(barcode: string): Promise<Product | undefined> {
    return db.products.where('barcode').equals(barcode).first()
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
    return db.products.where('category_id').equals(categoryId).and(p => p.is_active).toArray()
}

export async function getAllActiveProducts(): Promise<Product[]> {
    return db.products.filter(p => p.is_active).toArray()
}

export async function getUnsyncedTransactions(): Promise<Transaction[]> {
    return db.transactions.filter(t => !t.synced).toArray()
}

export async function addToSyncQueue(
    table: string,
    action: 'insert' | 'update' | 'delete',
    data: Record<string, unknown>
) {
    await db.syncQueue.add({
        table,
        action,
        data,
        created_at: new Date().toISOString(),
        retries: 0
    })
}

// Customer helpers
export async function getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    return db.customers.where('phone').equals(phone).first()
}

// Shift helpers
export async function getCurrentShift(cashierId: string): Promise<Shift | undefined> {
    return db.shifts.where({ cashier_id: cashierId, status: 'open' }).first()
}

// Discount helpers
export async function getDiscountByCode(code: string): Promise<Discount | undefined> {
    const now = new Date().toISOString()
    return db.discounts
        .where('code')
        .equals(code.toUpperCase())
        .filter(d => {
            if (!d.is_active) return false
            if (d.usage_limit && d.used_count >= d.usage_limit) return false
            if (d.start_date && d.start_date > now) return false
            if (d.end_date && d.end_date < now) return false
            return true
        })
        .first()
}

// Notification helpers
export async function getUnreadNotifications(): Promise<AppNotification[]> {
    return db.notifications.where('is_read').equals(0).toArray()
}

export async function checkLowStock(): Promise<Product[]> {
    return db.products.filter(p => p.is_active && p.stock <= p.min_stock).toArray()
}
