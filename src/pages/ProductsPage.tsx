import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Package, Loader2 } from 'lucide-react'
import { db, addToSyncQueue } from '@/lib/db'
import { formatCurrency, generateId } from '@/lib/utils'
import type { Product, Category } from '@/types'
import MainLayout from '@/components/layout/MainLayout'

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        category_id: '',
        price: '',
        cost_price: '',
        stock: '',
        min_stock: '5'
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        // Only load active products (is_active !== false)
        const prods = await db.products.filter(p => p.is_active !== false).toArray()
        prods.sort((a, b) => a.name.localeCompare(b.name))
        setProducts(prods)

        const cats = await db.categories.orderBy('sort_order').toArray()
        setCategories(cats)
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode?.includes(searchQuery)
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const productData: Product = {
                id: editingProduct?.id || generateId(),
                name: formData.name,
                barcode: formData.barcode || undefined,
                category_id: formData.category_id || undefined,
                price: parseFloat(formData.price),
                cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
                stock: parseInt(formData.stock) || 0,
                min_stock: parseInt(formData.min_stock) || 5,
                is_active: true,
                created_at: editingProduct?.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            await db.products.put(productData)
            await addToSyncQueue('products', editingProduct ? 'update' : 'insert', productData)

            setShowModal(false)
            setEditingProduct(null)
            resetForm()
            loadData()
        } catch (error) {
            console.error('Error saving product:', error)
            alert('Gagal menyimpan produk')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            barcode: product.barcode || '',
            category_id: product.category_id || '',
            price: product.price.toString(),
            cost_price: product.cost_price?.toString() || '',
            stock: product.stock.toString(),
            min_stock: product.min_stock.toString()
        })
        setShowModal(true)
    }

    const handleDelete = async (product: Product) => {
        if (!confirm(`Hapus produk "${product.name}"?`)) return

        await db.products.update(product.id, { is_active: false })
        await addToSyncQueue('products', 'update', { ...product, is_active: false })
        loadData()
    }

    const resetForm = () => {
        setFormData({
            name: '',
            barcode: '',
            category_id: '',
            price: '',
            cost_price: '',
            stock: '',
            min_stock: '5'
        })
    }

    const getCategoryName = (categoryId?: string) => {
        if (!categoryId) return '-'
        return categories.find(c => c.id === categoryId)?.name || '-'
    }

    return (
        <MainLayout title="Manajemen Produk">
            <div className="space-y-4">
                {/* Header Actions */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                        <input
                            type="text"
                            className="input"
                            style={{ paddingLeft: '2.5rem' }}
                            placeholder="Cari produk..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            resetForm()
                            setEditingProduct(null)
                            setShowModal(true)
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Produk
                    </button>
                </div>

                {/* Products Table */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700 bg-slate-800/50">
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Produk</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Barcode</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Kategori</th>
                                    <th className="text-right p-4 text-sm font-medium text-slate-400">Harga</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Stok</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">
                                            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>Belum ada produk</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map(product => (
                                        <tr
                                            key={product.id}
                                            className={`border-b border-slate-700/50 hover:bg-slate-800/50 ${!product.is_active ? 'opacity-50' : ''
                                                }`}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                                                        {product.image_url ? (
                                                            <img
                                                                src={product.image_url}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <Package className="w-5 h-5 text-slate-500" />
                                                        )}
                                                    </div>
                                                    <span className="font-medium">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-400 font-mono text-sm">
                                                {product.barcode || '-'}
                                            </td>
                                            <td className="p-4">
                                                <span className="badge badge-primary">
                                                    {getCategoryName(product.category_id)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right text-blue-400 font-semibold">
                                                {formatCurrency(product.price)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`badge ${product.stock <= 0 ? 'badge-danger' :
                                                    product.stock <= product.min_stock ? 'badge-warning' :
                                                        'badge-success'
                                                    }`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                                        onClick={() => handleEdit(product)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                                                        onClick={() => handleDelete(product)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="text-lg font-semibold">
                                {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                        Nama Produk *
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                            Barcode
                                        </label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.barcode}
                                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                            Kategori
                                        </label>
                                        <select
                                            className="input"
                                            value={formData.category_id}
                                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        >
                                            <option value="">Pilih Kategori</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                            Harga Jual *
                                        </label>
                                        <input
                                            type="number"
                                            className="input"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                            Harga Modal
                                        </label>
                                        <input
                                            type="number"
                                            className="input"
                                            value={formData.cost_price}
                                            onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                            Stok
                                        </label>
                                        <input
                                            type="number"
                                            className="input"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                            Minimum Stok
                                        </label>
                                        <input
                                            type="number"
                                            className="input"
                                            value={formData.min_stock}
                                            onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    )
}
