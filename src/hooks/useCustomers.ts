import { useState, useEffect, useCallback } from 'react'
import { db, addToSyncQueue } from '@/lib/db'
import { generateId } from '@/lib/utils'
import type { Customer } from '@/types'

interface UseCustomersOptions {
    searchQuery?: string
    limit?: number
}

export function useCustomers(options: UseCustomersOptions = {}) {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const loadCustomers = useCallback(async () => {
        try {
            setIsLoading(true)
            let result = await db.customers.orderBy('name').toArray()

            if (options.searchQuery) {
                const search = options.searchQuery.toLowerCase()
                result = result.filter(c =>
                    c.name.toLowerCase().includes(search) ||
                    c.phone?.toLowerCase().includes(search) ||
                    c.email?.toLowerCase().includes(search)
                )
            }

            if (options.limit) {
                result = result.slice(0, options.limit)
            }

            setCustomers(result)
            setError(null)
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [options.searchQuery, options.limit])

    useEffect(() => {
        loadCustomers()
    }, [loadCustomers])

    const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'total_spent' | 'visit_count' | 'points'>) => {
        const customer: Customer = {
            ...customerData,
            id: generateId(),
            total_spent: 0,
            visit_count: 0,
            points: 0,
            created_at: new Date().toISOString()
        }

        await db.customers.add(customer)
        await addToSyncQueue('customers', 'insert', customer)
        await loadCustomers()
        return customer
    }

    const updateCustomer = async (id: string, updates: Partial<Customer>) => {
        await db.customers.update(id, updates)
        await addToSyncQueue('customers', 'update', { id, ...updates })
        await loadCustomers()
    }

    const deleteCustomer = async (id: string) => {
        await db.customers.delete(id)
        await addToSyncQueue('customers', 'delete', { id })
        await loadCustomers()
    }

    const getCustomerById = async (id: string): Promise<Customer | undefined> => {
        return db.customers.get(id)
    }

    const searchCustomers = async (query: string): Promise<Customer[]> => {
        const search = query.toLowerCase()
        return db.customers
            .filter(c =>
                c.name.toLowerCase().includes(search) ||
                c.phone?.toLowerCase().includes(search)
            )
            .limit(10)
            .toArray()
    }

    const updateCustomerStats = async (id: string, transactionTotal: number) => {
        const customer = await db.customers.get(id)
        if (!customer) return

        const pointsEarned = Math.floor(transactionTotal / 10000) // 1 point per 10k

        await db.customers.update(id, {
            total_spent: (customer.total_spent || 0) + transactionTotal,
            visit_count: (customer.visit_count || 0) + 1,
            points: (customer.points || 0) + pointsEarned
        })

        await loadCustomers()
    }

    return {
        customers,
        isLoading,
        error,
        refresh: loadCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById,
        searchCustomers,
        updateCustomerStats
    }
}
