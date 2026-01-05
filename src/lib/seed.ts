import { db } from './db'
import { generateId } from './utils'
import type { Category, Product } from '@/types'

// Demo categories
const demoCategories: Omit<Category, 'id' | 'created_at'>[] = [
    { name: 'Makanan', color: '#F59E0B', sort_order: 0 },
    { name: 'Minuman', color: '#3B82F6', sort_order: 1 },
    { name: 'Snack', color: '#10B981', sort_order: 2 },
    { name: 'Rokok', color: '#EF4444', sort_order: 3 },
    { name: 'ATK', color: '#8B5CF6', sort_order: 4 },
    { name: 'Lainnya', color: '#6B7280', sort_order: 5 },
]

// Demo products
const demoProducts: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category_id'>[] = [
    // Makanan
    { name: 'Indomie Goreng', barcode: '089686010947', price: 3500, stock: 100, min_stock: 10, is_active: true },
    { name: 'Indomie Soto', barcode: '089686010954', price: 3500, stock: 80, min_stock: 10, is_active: true },
    { name: 'Indomie Ayam Bawang', barcode: '089686010961', price: 3500, stock: 60, min_stock: 10, is_active: true },
    { name: 'Mie Sedaap Goreng', barcode: '089686020143', price: 3500, stock: 75, min_stock: 10, is_active: true },
    { name: 'Pop Mie Ayam', barcode: '089686030242', price: 6000, stock: 50, min_stock: 10, is_active: true },
    { name: 'Roti Tawar Sari Roti', barcode: '089686040341', price: 15000, stock: 20, min_stock: 5, is_active: true },

    // Minuman
    { name: 'Aqua 600ml', barcode: '089686110015', price: 4000, stock: 150, min_stock: 20, is_active: true },
    { name: 'Aqua 1500ml', barcode: '089686110022', price: 8000, stock: 80, min_stock: 10, is_active: true },
    { name: 'Teh Pucuk 350ml', barcode: '089686120014', price: 5000, stock: 100, min_stock: 15, is_active: true },
    { name: 'Teh Botol Sosro 450ml', barcode: '089686120021', price: 5500, stock: 90, min_stock: 15, is_active: true },
    { name: 'Coca Cola 390ml', barcode: '089686130013', price: 7000, stock: 60, min_stock: 10, is_active: true },
    { name: 'Sprite 390ml', barcode: '089686130020', price: 7000, stock: 60, min_stock: 10, is_active: true },
    { name: 'Fanta 390ml', barcode: '089686130037', price: 7000, stock: 50, min_stock: 10, is_active: true },
    { name: 'Good Day Cappuccino 250ml', barcode: '089686140012', price: 6000, stock: 70, min_stock: 10, is_active: true },
    { name: 'Pocari Sweat 350ml', barcode: '089686150011', price: 8000, stock: 45, min_stock: 10, is_active: true },

    // Snack
    { name: 'Chitato Sapi Panggang', barcode: '089686210012', price: 10000, stock: 40, min_stock: 8, is_active: true },
    { name: 'Chitato Keju', barcode: '089686210029', price: 10000, stock: 35, min_stock: 8, is_active: true },
    { name: 'Lays Classic', barcode: '089686220011', price: 12000, stock: 30, min_stock: 8, is_active: true },
    { name: 'Qtela Tempe', barcode: '089686230010', price: 8000, stock: 50, min_stock: 10, is_active: true },
    { name: 'Taro Net', barcode: '089686240019', price: 5000, stock: 60, min_stock: 10, is_active: true },
    { name: 'Beng Beng', barcode: '089686250018', price: 3000, stock: 80, min_stock: 15, is_active: true },
    { name: 'Silverqueen 30g', barcode: '089686260017', price: 8000, stock: 40, min_stock: 8, is_active: true },

    // Rokok
    { name: 'Gudang Garam Surya 16', barcode: '089686310011', price: 28000, stock: 50, min_stock: 10, is_active: true },
    { name: 'Sampoerna Mild 16', barcode: '089686320010', price: 32000, stock: 50, min_stock: 10, is_active: true },
    { name: 'Marlboro Red 20', barcode: '089686330019', price: 40000, stock: 30, min_stock: 8, is_active: true },
    { name: 'Djarum Super 16', barcode: '089686340018', price: 26000, stock: 45, min_stock: 10, is_active: true },

    // ATK
    { name: 'Pulpen Standard AE7', barcode: '089686410017', price: 3000, stock: 100, min_stock: 20, is_active: true },
    { name: 'Buku Tulis Sinar Dunia', barcode: '089686420016', price: 5000, stock: 80, min_stock: 15, is_active: true },
    { name: 'Pensil 2B Faber Castell', barcode: '089686430015', price: 2500, stock: 120, min_stock: 25, is_active: true },
    { name: 'Penghapus Staedtler', barcode: '089686440014', price: 3500, stock: 60, min_stock: 10, is_active: true },

    // Lainnya
    { name: 'Pulsa 5.000', barcode: '089686510010', price: 6500, stock: 999, min_stock: 5, is_active: true },
    { name: 'Pulsa 10.000', barcode: '089686520019', price: 12000, stock: 999, min_stock: 5, is_active: true },
    { name: 'Pulsa 25.000', barcode: '089686530018', price: 27000, stock: 999, min_stock: 5, is_active: true },
    { name: 'Kantong Plastik Kecil', barcode: '089686540017', price: 500, stock: 500, min_stock: 50, is_active: true },
]

export async function seedDemoData(): Promise<void> {
    // Check if data already exists
    const existingCategories = await db.categories.count()
    if (existingCategories > 0) {
        // Data already exists
        return
    }

    // Seeding demo data

    // Create categories
    const categoryIds: Record<string, string> = {}
    for (const cat of demoCategories) {
        const id = generateId()
        categoryIds[cat.name] = id
        await db.categories.add({
            ...cat,
            id,
            created_at: new Date().toISOString()
        })
    }

    // Create products with category mapping
    const categoryMapping: Record<number, string> = {
        0: 'Makanan', 1: 'Makanan', 2: 'Makanan', 3: 'Makanan', 4: 'Makanan', 5: 'Makanan',
        6: 'Minuman', 7: 'Minuman', 8: 'Minuman', 9: 'Minuman', 10: 'Minuman', 11: 'Minuman', 12: 'Minuman', 13: 'Minuman', 14: 'Minuman',
        15: 'Snack', 16: 'Snack', 17: 'Snack', 18: 'Snack', 19: 'Snack', 20: 'Snack', 21: 'Snack',
        22: 'Rokok', 23: 'Rokok', 24: 'Rokok', 25: 'Rokok',
        26: 'ATK', 27: 'ATK', 28: 'ATK', 29: 'ATK',
        30: 'Lainnya', 31: 'Lainnya', 32: 'Lainnya', 33: 'Lainnya'
    }

    for (let i = 0; i < demoProducts.length; i++) {
        const prod = demoProducts[i]
        const categoryName = categoryMapping[i] || 'Lainnya'
        await db.products.add({
            ...prod,
            id: generateId(),
            category_id: categoryIds[categoryName],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
    }

    // Database seeded
}
