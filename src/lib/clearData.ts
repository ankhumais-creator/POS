// Script to clear IndexedDB
// Run this in browser console: localStorage.clear(); indexedDB.deleteDatabase('POSKasirDB'); location.reload()

import { db } from './db'

export async function clearAllLocalData(): Promise<void> {
    console.log('Clearing all local data...')

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

    console.log('All local data cleared!')
}

// Export for console use
if (typeof window !== 'undefined') {
    (window as any).clearAllLocalData = clearAllLocalData
}
