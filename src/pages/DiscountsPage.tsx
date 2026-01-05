import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Percent, Tag, Calendar, RefreshCw, X } from 'lucide-react'
import { db, addToSyncQueue } from '@/lib/db'
import { formatCurrency, formatDate, generateId } from '@/lib/utils'
import type { Discount } from '@/types'
import MainLayout from '@/components/layout/MainLayout'

export default function DiscountsPage() {
    const [discounts, setDiscounts] = useState<Discount[]>([])
    const [discountTotals, setDiscountTotals] = useState<Record<string, number>>({})
    const [searchQuery, setSearchQuery] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        type: 'percentage' as 'percentage' | 'fixed',
        value: '',
        min_purchase: '',
        max_discount: '',
        usage_limit: '',
        start_date: '',
        end_date: '',
        is_active: true
    })

    useEffect(() => {
        loadDiscounts()
    }, [])

    const loadDiscounts = async () => {
        // Get all discounts and sort in memory (created_at is not indexed)
        const data = await db.discounts.toArray()
        data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setDiscounts(data)

        // Calculate total discount used for each code from transactions
        const transactions = await db.transactions.filter(t => t.status === 'completed' && t.discount > 0).toArray()
        const totals: Record<string, number> = {}
        transactions.forEach(tx => {
            if (tx.discount_code) {
                totals[tx.discount_code] = (totals[tx.discount_code] || 0) + tx.discount
            }
        })
        setDiscountTotals(totals)
    }

    const filteredDiscounts = discounts.filter(d =>
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const discountData: Discount = {
                id: editingDiscount?.id || generateId(),
                code: formData.code.toUpperCase(),
                name: formData.name,
                type: formData.type,
                value: Number.parseFloat(formData.value),
                min_purchase: formData.min_purchase ? Number.parseFloat(formData.min_purchase) : undefined,
                max_discount: formData.max_discount ? Number.parseFloat(formData.max_discount) : undefined,
                usage_limit: formData.usage_limit ? Number.parseInt(formData.usage_limit, 10) : undefined,
                used_count: editingDiscount?.used_count || 0,
                start_date: formData.start_date || undefined,
                end_date: formData.end_date || undefined,
                is_active: formData.is_active,
                created_at: editingDiscount?.created_at || new Date().toISOString()
            }

            await db.discounts.put(discountData)
            await addToSyncQueue('discounts', editingDiscount ? 'update' : 'insert', discountData)

            setShowModal(false)
            setEditingDiscount(null)
            resetForm()
            loadDiscounts()
        } catch (error) {
            console.error('Error saving discount:', error)
            alert('Gagal menyimpan diskon. Silakan coba lagi.')
        }
    }

    const handleEdit = (discount: Discount) => {
        setEditingDiscount(discount)
        setFormData({
            code: discount.code,
            name: discount.name,
            type: discount.type,
            value: discount.value.toString(),
            min_purchase: discount.min_purchase?.toString() || '',
            max_discount: discount.max_discount?.toString() || '',
            usage_limit: discount.usage_limit?.toString() || '',
            start_date: discount.start_date?.split('T')[0] || '',
            end_date: discount.end_date?.split('T')[0] || '',
            is_active: discount.is_active
        })
        setShowModal(true)
    }

    const handleDelete = async (discount: Discount) => {
        if (!confirm(`Hapus diskon "${discount.code}"?`)) return
        await db.discounts.delete(discount.id)
        await addToSyncQueue('discounts', 'delete', { id: discount.id })
        loadDiscounts()
    }

    const handleToggle = async (discount: Discount) => {
        const updated = { ...discount, is_active: !discount.is_active }
        await db.discounts.put(updated)
        await addToSyncQueue('discounts', 'update', updated)
        loadDiscounts()
    }

    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            type: 'percentage',
            value: '',
            min_purchase: '',
            max_discount: '',
            usage_limit: '',
            start_date: '',
            end_date: '',
            is_active: true
        })
    }

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = ''
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setFormData({ ...formData, code })
    }

    return (
        <MainLayout title="Diskon & Promo">
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                        <input type="text" className="input" style={{ paddingLeft: '2.5rem' }} placeholder="Cari kode diskon..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" onClick={() => { resetForm(); setEditingDiscount(null); setShowModal(true) }} data-testid="add-discount-button">
                        <Plus className="w-4 h-4" />
                        Tambah
                    </button>
                </div>

                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700 bg-slate-800/50">
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Kode</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Nama</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Nilai</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Penggunaan</th>
                                    <th className="text-right p-4 text-sm font-medium text-slate-400">Total Diskon</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Periode</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Status</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDiscounts.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-slate-500">
                                            <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>Belum ada diskon</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDiscounts.map(discount => (
                                        <tr key={discount.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                                            <td className="p-4">
                                                <span className="font-mono font-bold text-blue-400">{discount.code}</span>
                                            </td>
                                            <td className="p-4">{discount.name}</td>
                                            <td className="p-4 text-center">
                                                {discount.type === 'percentage' ? (
                                                    <span className="badge badge-primary">{discount.value}%</span>
                                                ) : (
                                                    <span className="badge badge-success">{formatCurrency(discount.value)}</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center text-sm">
                                                {discount.used_count}{discount.usage_limit ? `/${discount.usage_limit}` : ''}
                                            </td>
                                            <td className="p-4 text-right text-sm font-semibold text-emerald-400">
                                                {formatCurrency(discountTotals[discount.code] || 0)}
                                            </td>
                                            <td className="p-4 text-center text-sm text-slate-400">
                                                {discount.start_date || discount.end_date ? (
                                                    <>
                                                        {discount.start_date?.split('T')[0] || '∞'} - {discount.end_date?.split('T')[0] || '∞'}
                                                    </>
                                                ) : 'Tanpa batas'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => handleToggle(discount)}
                                                    className={`badge cursor-pointer ${discount.is_active ? 'badge-success' : 'badge-danger'}`}
                                                >
                                                    {discount.is_active ? 'Aktif' : 'Nonaktif'}
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => handleEdit(discount)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(discount)} className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400">
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

            {showModal && (
                <div className="modal-overlay" data-testid="discount-form-modal" onClick={() => setShowModal(false)}>
                    <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="text-lg font-semibold">{editingDiscount ? 'Edit' : 'Tambah'} Diskon</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Kode Voucher *</label>
                                    <div className="flex gap-2">
                                        <input type="text" className="input flex-1 font-mono uppercase" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required placeholder="DISC20" data-testid="discount-code-field" />
                                        <button type="button" className="btn btn-secondary" onClick={generateCode} data-testid="generate-code-button">
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Nama Promo *</label>
                                    <input type="text" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Diskon Tahun Baru" data-testid="discount-name-field" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Tipe</label>
                                        <select className="input" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })} data-testid="discount-type-field">
                                            <option value="percentage">Persen (%)</option>
                                            <option value="fixed">Nominal (Rp)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Nilai *</label>
                                        <input type="number" className="input" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} required placeholder={formData.type === 'percentage' ? '10' : '10000'} data-testid="discount-value-field" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Min. Belanja</label>
                                        <input type="number" className="input" value={formData.min_purchase} onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })} placeholder="50000" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Maks. Diskon</label>
                                        <input type="number" className="input" value={formData.max_discount} onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })} placeholder="20000" disabled={formData.type === 'fixed'} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Batas Penggunaan</label>
                                    <input type="number" className="input" value={formData.usage_limit} onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })} placeholder="Kosongkan untuk unlimited" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Mulai</label>
                                        <input type="date" className="input" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Berakhir</label>
                                        <input type="date" className="input" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 rounded" />
                                    <span className="text-sm">Aktifkan diskon ini</span>
                                </label>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary" data-testid="submit-discount-button">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    )
}

