// Script to clear IndexedDB
// Run this in browser console: localStorage.clear(); indexedDB.deleteDatabase('POSKasirDB'); location.reload()

import { db } from './db'

export async function clearAllLocalData(): Promise<void> {
    // Clearing local data

    // Clear IndexedDB
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
    await db.activityLogs.clear()

    // Clear localStorage
    localStorage.clear()

    // Data cleared
}

// Export for console use
if (typeof globalThis.window !== 'undefined') {
    (globalThis as any).clearAllLocalData = clearAllLocalData
}
