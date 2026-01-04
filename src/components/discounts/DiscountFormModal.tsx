import { useState } from 'react'
import { X, RefreshCw } from 'lucide-react'
import type { Discount } from '@/types'

interface DiscountFormData {
    code: string
    name: string
    type: 'percentage' | 'fixed'
    value: string
    min_purchase: string
    max_discount: string
    usage_limit: string
    valid_from: string
    valid_until: string
}

interface DiscountFormModalProps {
    readonly isOpen: boolean
    readonly editingDiscount: Discount | null
    readonly onClose: () => void
    readonly onSubmit: (formData: DiscountFormData) => void
}

const initialFormData: DiscountFormData = {
    code: '',
    name: '',
    type: 'percentage',
    value: '',
    min_purchase: '',
    max_discount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: ''
}

export function DiscountFormModal({ isOpen, editingDiscount, onClose, onSubmit }: DiscountFormModalProps) {
    const [formData, setFormData] = useState<DiscountFormData>(
        editingDiscount ? {
            code: editingDiscount.code,
            name: editingDiscount.name,
            type: editingDiscount.type,
            value: String(editingDiscount.value),
            min_purchase: editingDiscount.min_purchase ? String(editingDiscount.min_purchase) : '',
            max_discount: editingDiscount.max_discount ? String(editingDiscount.max_discount) : '',
            usage_limit: editingDiscount.usage_limit ? String(editingDiscount.usage_limit) : '',
            valid_from: editingDiscount.valid_from || '',
            valid_until: editingDiscount.valid_until || ''
        } : initialFormData
    )

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = ''
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setFormData(prev => ({ ...prev, code }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
        setFormData(initialFormData)
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" data-testid="discount-form-modal">
            <div className="modal" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3>{editingDiscount ? 'Edit Diskon' : 'Tambah Diskon'}</h3>
                    <button className="modal-close" onClick={onClose} data-testid="close-modal-button">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body" data-testid="discount-form">
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Kode Diskon</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="input flex-1 uppercase"
                                    placeholder="PROMO2024"
                                    value={formData.code}
                                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                    required
                                    data-testid="discount-code-field"
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary px-3"
                                    onClick={generateCode}
                                    title="Generate kode"
                                    data-testid="generate-code-button"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Nama Promo</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Nama promo"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                                data-testid="discount-name-field"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Tipe</label>
                                <select
                                    className="input"
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'percentage' | 'fixed' }))}
                                    data-testid="discount-type-field"
                                >
                                    <option value="percentage">Persentase (%)</option>
                                    <option value="fixed">Nominal (Rp)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Nilai</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder={formData.type === 'percentage' ? '10' : '50000'}
                                    value={formData.value}
                                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                                    required
                                    data-testid="discount-value-field"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Min. Pembelian</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="100000"
                                    value={formData.min_purchase}
                                    onChange={(e) => setFormData(prev => ({ ...prev, min_purchase: e.target.value }))}
                                    data-testid="discount-min-purchase-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Maks. Diskon</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="50000"
                                    value={formData.max_discount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, max_discount: e.target.value }))}
                                    data-testid="discount-max-discount-field"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Batas Penggunaan</label>
                            <input
                                type="number"
                                className="input"
                                placeholder="100 (kosongkan untuk unlimited)"
                                value={formData.usage_limit}
                                onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value }))}
                                data-testid="discount-usage-limit-field"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Berlaku Dari</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={formData.valid_from}
                                    onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                                    data-testid="discount-valid-from-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Berlaku Sampai</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={formData.valid_until}
                                    onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                                    data-testid="discount-valid-until-field"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                        <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>
                            Batal
                        </button>
                        <button type="submit" className="btn btn-primary flex-1" data-testid="submit-discount-button">
                            {editingDiscount ? 'Simpan' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
