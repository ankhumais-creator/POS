import { create } from 'zustand'
import type { CartItem, Product } from '@/types'

interface CartState {
    items: CartItem[]
    discount: number
    subtotal: number
    total: number

    addItem: (product: Product) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    updateItemDiscount: (productId: string, discount: number) => void
    setDiscount: (discount: number) => void
    clearCart: () => void
    setItems: (items: CartItem[]) => void
}

const calculateTotals = (items: CartItem[], discount: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const total = Math.max(0, subtotal - discount)
    return { subtotal, total }
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    discount: 0,
    subtotal: 0,
    total: 0,

    addItem: (product) => {
        const { items, discount } = get()
        const existingItem = items.find(item => item.product_id === product.id)

        let newItems: CartItem[]

        if (existingItem) {
            newItems = items.map(item =>
                item.product_id === product.id
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                        subtotal: (item.quantity + 1) * item.price - item.discount
                    }
                    : item
            )
        } else {
            const newItem: CartItem = {
                product_id: product.id,
                product_name: product.name,
                price: product.price,
                quantity: 1,
                discount: 0,
                subtotal: product.price,
                image_url: product.image_url
            }
            newItems = [...items, newItem]
        }

        const totals = calculateTotals(newItems, discount)
        set({ items: newItems, ...totals })
    },

    removeItem: (productId) => {
        const { items, discount } = get()
        const newItems = items.filter(item => item.product_id !== productId)
        const totals = calculateTotals(newItems, discount)
        set({ items: newItems, ...totals })
    },

    updateQuantity: (productId, quantity) => {
        if (quantity < 1) return

        const { items, discount } = get()
        const newItems = items.map(item =>
            item.product_id === productId
                ? {
                    ...item,
                    quantity,
                    subtotal: quantity * item.price - item.discount
                }
                : item
        )

        const totals = calculateTotals(newItems, discount)
        set({ items: newItems, ...totals })
    },

    updateItemDiscount: (productId, itemDiscount) => {
        const { items, discount } = get()
        const newItems = items.map(item =>
            item.product_id === productId
                ? {
                    ...item,
                    discount: itemDiscount,
                    subtotal: item.quantity * item.price - itemDiscount
                }
                : item
        )

        const totals = calculateTotals(newItems, discount)
        set({ items: newItems, ...totals })
    },

    setDiscount: (discount) => {
        const { items } = get()
        const totals = calculateTotals(items, discount)
        set({ discount, ...totals })
    },

    clearCart: () => {
        set({ items: [], discount: 0, subtotal: 0, total: 0 })
    },

    setItems: (items) => {
        const totals = calculateTotals(items, 0)
        set({ items, discount: 0, ...totals })
    }
}))
