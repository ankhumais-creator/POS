import { db, addToSyncQueue } from './db'
import { supabase, isSupabaseConfigured } from './supabase'
import { useSettingsStore } from '@/stores/settingsStore'
import type { Product, Category, Transaction, TransactionItem } from '@/types'

// Sync products from Supabase to IndexedDB
export async function syncProductsFromServer(): Promise<void> {
    if (!isSupabaseConfigured()) return

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)

        if (error) throw error

        if (data) {
            await db.products.clear()
            await db.products.bulkPut(data)
        }
    } catch (error) {
        console.error('Failed to sync products:', error)
    }
}

// Sync categories from Supabase to IndexedDB
export async function syncCategoriesFromServer(): Promise<void> {
    if (!isSupabaseConfigured()) return

    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('sort_order')

        if (error) throw error

        if (data) {
            await db.categories.clear()
            await db.categories.bulkPut(data)
        }
    } catch (error) {
        console.error('Failed to sync categories:', error)
    }
}

// Sync pending transactions to server
export async function syncTransactionsToServer(): Promise<void> {
    if (!isSupabaseConfigured()) return

    const settingsStore = useSettingsStore.getState()
    if (!settingsStore.isOnline) return

    settingsStore.setSyncing(true)

    try {
        // Get unsynced transactions
        const unsyncedTransactions = await db.transactions
            .where('synced')
            .equals(0)
            .toArray()

        for (const transaction of unsyncedTransactions) {
            // Get transaction items
            const items = await db.transactionItems
                .where('transaction_id')
                .equals(transaction.id)
                .toArray()

            // Upload transaction
            const { error: txError } = await supabase
                .from('transactions')
                .upsert(transaction)

            if (txError) {
                console.error('Failed to sync transaction:', txError)
                continue
            }

            // Upload transaction items
            if (items.length > 0) {
                const { error: itemsError } = await supabase
                    .from('transaction_items')
                    .upsert(items)

                if (itemsError) {
                    console.error('Failed to sync transaction items:', itemsError)
                    continue
                }
            }

            // Mark as synced
            await db.transactions.update(transaction.id, { synced: true })
        }
    } catch (error) {
        console.error('Sync failed:', error)
    } finally {
        settingsStore.setSyncing(false)
    }
}

// Process sync queue
export async function processSyncQueue(): Promise<void> {
    if (!isSupabaseConfigured()) return

    const settingsStore = useSettingsStore.getState()
    if (!settingsStore.isOnline) return

    const queueItems = await db.syncQueue.toArray()

    for (const item of queueItems) {
        try {
            let error = null

            switch (item.action) {
                case 'insert':
                    ({ error } = await supabase.from(item.table).insert(item.data))
                    break
                case 'update':
                    ({ error } = await supabase.from(item.table).upsert(item.data))
                    break
                case 'delete':
                    ({ error } = await supabase.from(item.table).delete().eq('id', item.data.id))
                    break
            }

            if (error) {
                console.error(`Sync queue error for ${item.table}:`, error)
                // Increment retry count
                await db.syncQueue.update(item.id!, { retries: item.retries + 1 })
            } else {
                // Remove from queue on success
                await db.syncQueue.delete(item.id!)
            }
        } catch (error) {
            console.error('Queue processing error:', error)
        }
    }
}

// Save transaction locally and queue for sync
export async function saveTransaction(
    transaction: Transaction,
    items: TransactionItem[]
): Promise<void> {
    // Save to IndexedDB first (offline-first)
    await db.transactions.put({ ...transaction, synced: false })
    await db.transactionItems.bulkPut(items)

    // Update stock locally
    for (const item of items) {
        const product = await db.products.get(item.product_id)
        if (product) {
            await db.products.update(item.product_id, {
                stock: Math.max(0, product.stock - item.quantity)
            })
        }
    }

    // Try to sync if online
    if (useSettingsStore.getState().isOnline) {
        syncTransactionsToServer()
    }
}

// Full sync - pull from server and push pending changes
export async function fullSync(): Promise<void> {
    if (!isSupabaseConfigured()) return

    const settingsStore = useSettingsStore.getState()
    if (!settingsStore.isOnline) return

    settingsStore.setSyncing(true)

    try {
        // First, push pending changes
        await syncTransactionsToServer()
        await processSyncQueue()

        // Then, pull latest data
        await syncCategoriesFromServer()
        await syncProductsFromServer()
    } finally {
        settingsStore.setSyncing(false)
    }
}

// Initialize sync on app load
export async function initializeSync(): Promise<void> {
    // Set up online listener for auto-sync
    if (typeof window !== 'undefined') {
        window.addEventListener('online', () => {
            fullSync()
        })
    }

    // Initial sync if online
    if (navigator.onLine && isSupabaseConfigured()) {
        await fullSync()
    }
}
