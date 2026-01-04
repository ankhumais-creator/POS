import { useState, useEffect } from 'react'
import { Package, Plus, ArrowUpCircle, ArrowDownCircle, ClipboardCheck, Search } from 'lucide-react'
import { db, addToSyncQueue } from '@/lib/db'
import { formatCurrency, formatDate, generateId } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import type { Product, StockAdjustment } from '@/types'
import MainLayout from '@/components/layout/MainLayout'

export default function StockOpnamePage() {
    const [products, setProducts] = useState<Product[]>([])
    const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [adjustmentType, setAdjustmentType] = useState<'in' | 'out' | 'opname'>('opname')
    const [quantity, setQuantity] = useState('')
    const [reason, setReason] = useState('')

    const user = useAuthStore((state) => state.user)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const prods = await db.products.filter(p => p.is_active).toArray()
        setProducts(prods)

        const adjs = await db.stockAdjustments.orderBy('created_at').reverse().limit(50).toArray()
        setAdjustments(adjs)
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode?.includes(searchQuery)
    )

    const handleAdjust = (product: Product) => {
        setSelectedProduct(product)
        setQuantity(product.stock.toString())
        setAdjustmentType('opname')
        setReason('')
        setShowModal(true)
    }

    const handleSubmit = async () => {
        if (!selectedProduct || !quantity || !user) return

        const newQty = parseInt(quantity)
        let adjustmentQty = newQty

        if (adjustmentType === 'opname') {
            adjustmentQty = newQty - selectedProduct.stock
        } else if (adjustmentType === 'out') {
            adjustmentQty = -Math.abs(parseInt(quantity))
        }

        const finalStock = adjustmentType === 'opname'
            ? newQty
            : selectedProduct.stock + adjustmentQty

        // Create adjustment record
        const adjustment: StockAdjustment = {
            id: generateId(),
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
            adjustment_type: adjustmentType,
            quantity: adjustmentQty,
            stock_before: selectedProduct.stock,
            stock_after: finalStock,
            reason: reason || getDefaultReason(adjustmentType),
            created_by: user.full_name,
            created_at: new Date().toISOString()
        }

        await db.stockAdjustments.add(adjustment)
        await addToSyncQueue('stock_adjustments', 'insert', adjustment)

        // Update product stock
        await db.products.update(selectedProduct.id, {
            stock: finalStock,
            updated_at: new Date().toISOString()
        })
        await addToSyncQueue('products', 'update', { id: selectedProduct.id, stock: finalStock })

        setShowModal(false)
        setSelectedProduct(null)
        setQuantity('')
        setReason('')
        loadData()
    }

    const getDefaultReason = (type: string) => {
        switch (type) {
            case 'in': return 'Stok masuk'
            case 'out': return 'Stok keluar'
            case 'opname': return 'Penyesuaian stok opname'
            default: return ''
        }
    }

    return (
        <MainLayout title="Stock Opname">
            <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="card p-4">
                        <p className="text-sm text-slate-400">Total Produk</p>
                        <p className="text-2xl font-bold">{products.length}</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-sm text-slate-400">Stok Rendah</p>
                        <p className="text-2xl font-bold text-amber-400">{products.filter(p => p.stock <= p.min_stock).length}</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-sm text-slate-400">Stok Habis</p>
                        <p className="text-2xl font-bold text-red-400">{products.filter(p => p.stock <= 0).length}</p>
                    </div>
                </div>

                {/* Product List for Adjustment */}
                <div className="card">
                    <div className="card-header flex items-center justify-between">
                        <h3 className="font-semibold">Penyesuaian Stok</h3>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                            <input
                                type="text"
                                className="input py-1.5 text-sm"
                                style={{ paddingLeft: '2.25rem' }}
                                placeholder="Cari produk..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700 bg-slate-800/50">
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Produk</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Barcode</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Stok</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Min</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Status</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr key={product.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center">
                                                    <Package className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <span className="font-medium">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-400 font-mono text-sm">{product.barcode || '-'}</td>
                                        <td className="p-4 text-center font-semibold">{product.stock}</td>
                                        <td className="p-4 text-center text-slate-400">{product.min_stock}</td>
                                        <td className="p-4 text-center">
                                            <span className={`badge ${product.stock <= 0 ? 'badge-danger' :
                                                product.stock <= product.min_stock ? 'badge-warning' :
                                                    'badge-success'
                                                }`}>
                                                {product.stock <= 0 ? 'Habis' : product.stock <= product.min_stock ? 'Rendah' : 'OK'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => handleAdjust(product)}
                                            >
                                                <ClipboardCheck className="w-3 h-3" />
                                                Adjust
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Adjustments */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-semibold">Riwayat Penyesuaian</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700 bg-slate-800/50">
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Waktu</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Produk</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Tipe</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Perubahan</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Alasan</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Oleh</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adjustments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">Belum ada penyesuaian stok</td>
                                    </tr>
                                ) : (
                                    adjustments.map(adj => (
                                        <tr key={adj.id} className="border-b border-slate-700/50">
                                            <td className="p-4 text-sm text-slate-400">{formatDate(adj.created_at)}</td>
                                            <td className="p-4 font-medium">{adj.product_name}</td>
                                            <td className="p-4 text-center">
                                                {adj.adjustment_type === 'in' && <ArrowUpCircle className="w-4 h-4 text-emerald-400 mx-auto" />}
                                                {adj.adjustment_type === 'out' && <ArrowDownCircle className="w-4 h-4 text-red-400 mx-auto" />}
                                                {adj.adjustment_type === 'opname' && <ClipboardCheck className="w-4 h-4 text-blue-400 mx-auto" />}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={adj.quantity >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                                    {adj.quantity >= 0 ? '+' : ''}{adj.quantity}
                                                </span>
                                                <span className="text-slate-500 text-sm ml-1">({adj.stock_before} → {adj.stock_after})</span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-400">{adj.reason}</td>
                                            <td className="p-4 text-sm">{adj.created_by}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Adjustment Modal */}
            {showModal && selectedProduct && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="text-lg font-semibold">Penyesuaian Stok</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400">×</button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div className="p-3 bg-slate-800/50 rounded-lg">
                                <p className="font-medium">{selectedProduct.name}</p>
                                <p className="text-sm text-slate-400">Stok saat ini: <strong>{selectedProduct.stock}</strong></p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Tipe Penyesuaian</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        className={`p-2 rounded-lg border text-sm ${adjustmentType === 'opname' ? 'bg-blue-500 border-blue-500' : 'border-slate-700'}`}
                                        onClick={() => setAdjustmentType('opname')}
                                    >
                                        <ClipboardCheck className="w-4 h-4 mx-auto mb-1" />
                                        Opname
                                    </button>
                                    <button
                                        className={`p-2 rounded-lg border text-sm ${adjustmentType === 'in' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700'}`}
                                        onClick={() => setAdjustmentType('in')}
                                    >
                                        <ArrowUpCircle className="w-4 h-4 mx-auto mb-1" />
                                        Masuk
                                    </button>
                                    <button
                                        className={`p-2 rounded-lg border text-sm ${adjustmentType === 'out' ? 'bg-red-500 border-red-500' : 'border-slate-700'}`}
                                        onClick={() => setAdjustmentType('out')}
                                    >
                                        <ArrowDownCircle className="w-4 h-4 mx-auto mb-1" />
                                        Keluar
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                    {adjustmentType === 'opname' ? 'Stok Aktual' : 'Jumlah'}
                                </label>
                                <input
                                    type="number"
                                    className="input"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Alasan</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder={getDefaultReason(adjustmentType)}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleSubmit} disabled={!quantity}>Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    )
}
