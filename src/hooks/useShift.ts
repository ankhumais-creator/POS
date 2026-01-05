import { useState, useEffect, useCallback } from 'react'
import { db, addToSyncQueue } from '@/lib/db'
import { generateId } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import type { Shift } from '@/types'

export function useShift() {
    const [currentShift, setCurrentShift] = useState<Shift | null>(null)
    const [shifts, setShifts] = useState<Shift[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const user = useAuthStore((state) => state.user)

    const loadCurrentShift = useCallback(async () => {
        try {
            setIsLoading(true)
            const activeShift = await db.shifts
                .where('status')
                .equals('open')
                .first()

            setCurrentShift(activeShift || null)
        } catch (err) {
            console.error('Failed to load current shift:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const loadShifts = useCallback(async (limit = 10) => {
        try {
            const result = await db.shifts
                .orderBy('opened_at')
                .reverse()
                .limit(limit)
                .toArray()
            setShifts(result)
        } catch (err) {
            console.error('Failed to load shifts:', err)
        }
    }, [])

    useEffect(() => {
        loadCurrentShift()
        loadShifts()
    }, [loadCurrentShift, loadShifts])

    const openShift = async (openingCash: number, notes?: string) => {
        if (currentShift) {
            throw new Error('There is already an open shift')
        }

        const shift: Shift = {
            id: generateId(),
            cashier_id: user?.id || 'local',
            cashier_name: user?.full_name || 'Kasir',
            status: 'open',
            opening_cash: openingCash,
            closing_cash: 0,
            expected_cash: openingCash,
            difference: 0,
            total_sales: 0,
            total_transactions: 0,
            notes: notes || '',
            opened_at: new Date().toISOString(),
            closed_at: ''
        }

        await db.shifts.add(shift)
        await addToSyncQueue('shifts', 'insert', shift)
        setCurrentShift(shift)
        await loadShifts()
        return shift
    }

    const closeShift = async (closingCash: number, notes?: string) => {
        if (!currentShift) {
            throw new Error('No open shift to close')
        }

        const cashDifference = closingCash - (currentShift.expected_cash ?? currentShift.opening_cash)

        const updates = {
            status: 'closed' as const,
            closing_cash: closingCash,
            difference: cashDifference,
            notes: notes || currentShift.notes,
            closed_at: new Date().toISOString()
        }

        await db.shifts.update(currentShift.id, updates)
        await addToSyncQueue('shifts', 'update', { id: currentShift.id, ...updates })

        setCurrentShift(null)
        await loadShifts()
    }

    const updateShiftSales = async (amount: number) => {
        if (!currentShift) return

        const updates = {
            total_sales: currentShift.total_sales + amount,
            total_transactions: currentShift.total_transactions + 1,
            expected_cash: (currentShift.expected_cash ?? currentShift.opening_cash) + amount
        }

        await db.shifts.update(currentShift.id, updates)
        setCurrentShift({ ...currentShift, ...updates })
    }

    const hasActiveShift = (): boolean => {
        return currentShift !== null && currentShift.status === 'open'
    }

    return {
        currentShift,
        shifts,
        isLoading,
        hasActiveShift,
        openShift,
        closeShift,
        updateShiftSales,
        refresh: loadCurrentShift
    }
}
