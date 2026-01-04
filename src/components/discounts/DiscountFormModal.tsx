import { useState, useId } from 'react'
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
    start_date: string
    end_date: string
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
    start_date: '',
    end_date: ''
}

export function DiscountFormModal({ isOpen, editingDiscount, onClose, onSubmit }: DiscountFormModalProps) {
    const formId = useId()
    const [formData, setFormData] = useState<DiscountFormData>(
        editingDiscount ? {
            code: editingDiscount.code,
            name: editingDiscount.name,
            type: editingDiscount.type,
            value: String(editingDiscount.value),
            min_purchase: editingDiscount.min_purchase ? String(editingDiscount.min_purchase) : '',
            max_discount: editingDiscount.max_discount ? String(editingDiscount.max_discount) : '',
            usage_limit: editingDiscount.usage_limit ? String(editingDiscount.usage_limit) : '',
            start_date: editingDiscount.start_date || '',
            end_date: editingDiscount.end_date || ''
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
                            <label htmlFor={`${formId}-code`} className="block text-sm text-slate-400 mb-1">Kode Diskon</label>
                            <div className="flex gap-2">
                                <input
                                    id={`${formId}-code`}
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
                            <label htmlFor={`${formId}-name`} className="block text-sm text-slate-400 mb-1">Nama Promo</label>
                            <input
                                id={`${formId}-name`}
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
                                <label htmlFor={`${formId}-type`} className="block text-sm text-slate-400 mb-1">Tipe</label>
                                <select
                                    id={`${formId}-type`}
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
                                <label htmlFor={`${formId}-value`} className="block text-sm text-slate-400 mb-1">Nilai</label>
                                <input
                                    id={`${formId}-value`}
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
                                <label htmlFor={`${formId}-min`} className="block text-sm text-slate-400 mb-1">Min. Pembelian</label>
                                <input
                                    id={`${formId}-min`}
                                    type="number"
                                    className="input"
                                    placeholder="100000"
                                    value={formData.min_purchase}
                                    onChange={(e) => setFormData(prev => ({ ...prev, min_purchase: e.target.value }))}
                                    data-testid="discount-min-purchase-field"
                                />
                            </div>
                            <div>
                                <label htmlFor={`${formId}-max`} className="block text-sm text-slate-400 mb-1">Maks. Diskon</label>
                                <input
                                    id={`${formId}-max`}
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
                            <label htmlFor={`${formId}-limit`} className="block text-sm text-slate-400 mb-1">Batas Penggunaan</label>
                            <input
                                id={`${formId}-limit`}
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
                                <label htmlFor={`${formId}-start`} className="block text-sm text-slate-400 mb-1">Berlaku Dari</label>
                                <input
                                    id={`${formId}-start`}
                                    type="date"
                                    className="input"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                    data-testid="discount-start-date-field"
                                />
                            </div>
                            <div>
                                <label htmlFor={`${formId}-end`} className="block text-sm text-slate-400 mb-1">Berlaku Sampai</label>
                                <input
                                    id={`${formId}-end`}
                                    type="date"
                                    className="input"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                    data-testid="discount-end-date-field"
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
