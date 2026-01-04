import { useState, useEffect, useCallback } from 'react'
import { db, addToSyncQueue } from '@/lib/db'
import { generateId } from '@/lib/utils'
import type { Product, Category } from '@/types'

interface UseProductsOptions {
    categoryId?: string
    searchQuery?: string
    includeInactive?: boolean
}

export function useProducts(options: UseProductsOptions = {}) {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const loadProducts = useCallback(async () => {
        try {
            setIsLoading(true)
            let query = db.products.orderBy('name')

            if (!options.includeInactive) {
                query = query.filter(p => p.is_active !== false)
            }

            let result = await query.toArray()

            if (options.categoryId) {
                result = result.filter(p => p.category_id === options.categoryId)
            }

            if (options.searchQuery) {
                const search = options.searchQuery.toLowerCase()
                result = result.filter(p =>
                    p.name.toLowerCase().includes(search) ||
                    p.barcode?.toLowerCase().includes(search)
                )
            }

            setProducts(result)
            setError(null)
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [options.categoryId, options.searchQuery, options.includeInactive])

    const loadCategories = useCallback(async () => {
        try {
            const cats = await db.categories.orderBy('sort_order').toArray()
            setCategories(cats)
        } catch (err) {
            console.error('Failed to load categories:', err)
        }
    }, [])

    useEffect(() => {
        loadProducts()
        loadCategories()
    }, [loadProducts, loadCategories])

    const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
        const product: Product = {
            ...productData,
            id: generateId(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        await db.products.add(product)
        await addToSyncQueue('products', 'insert', product)
        await loadProducts()
        return product
    }

    const updateProduct = async (id: string, updates: Partial<Product>) => {
        const updatedData = {
            ...updates,
            updated_at: new Date().toISOString()
        }

        await db.products.update(id, updatedData)
        await addToSyncQueue('products', 'update', { id, ...updatedData })
        await loadProducts()
    }

    const deleteProduct = async (id: string) => {
        await db.products.delete(id)
        await addToSyncQueue('products', 'delete', { id })
        await loadProducts()
    }

    const getProductByBarcode = async (barcode: string): Promise<Product | undefined> => {
        return db.products.where('barcode').equals(barcode).first()
    }

    const getProductById = async (id: string): Promise<Product | undefined> => {
        return db.products.get(id)
    }

    const updateStock = async (id: string, quantity: number, operation: 'add' | 'subtract' | 'set') => {
        const product = await db.products.get(id)
        if (!product) return

        let newStock = product.stock
        switch (operation) {
            case 'add':
                newStock += quantity
                break
            case 'subtract':
                newStock -= quantity
                break
            case 'set':
                newStock = quantity
                break
        }

        await db.products.update(id, { stock: newStock, updated_at: new Date().toISOString() })
        await addToSyncQueue('products', 'update', { id, stock: newStock })
        await loadProducts()
    }

    return {
        products,
        categories,
        isLoading,
        error,
        refresh: loadProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductByBarcode,
        getProductById,
        updateStock
    }
}

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const loadCategories = useCallback(async () => {
        setIsLoading(true)
        const cats = await db.categories.orderBy('sort_order').toArray()
        setCategories(cats)
        setIsLoading(false)
    }, [])

    useEffect(() => {
        loadCategories()
    }, [loadCategories])

    const addCategory = async (name: string, color?: string) => {
        const category: Category = {
            id: generateId(),
            name,
            color: color || '#3B82F6',
            sort_order: categories.length,
            created_at: new Date().toISOString()
        }

        await db.categories.add(category)
        await addToSyncQueue('categories', 'insert', category)
        await loadCategories()
        return category
    }

    const updateCategory = async (id: string, updates: Partial<Category>) => {
        await db.categories.update(id, updates)
        await addToSyncQueue('categories', 'update', { id, ...updates })
        await loadCategories()
    }

    const deleteCategory = async (id: string) => {
        await db.categories.delete(id)
        await addToSyncQueue('categories', 'delete', { id })
        await loadCategories()
    }

    return {
        categories,
        isLoading,
        refresh: loadCategories,
        addCategory,
        updateCategory,
        deleteCategory
    }
}
