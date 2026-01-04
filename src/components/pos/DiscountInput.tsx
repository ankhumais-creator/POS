import { Tag, X } from 'lucide-react'
import type { Discount } from '@/types'

interface DiscountInputProps {
    readonly appliedDiscount: Discount | null
    readonly discountCode: string
    readonly discountError: string
    readonly onDiscountCodeChange: (code: string) => void
    readonly onApplyDiscount: () => void
    readonly onRemoveDiscount: () => void
}

export function DiscountInput({
    appliedDiscount,
    discountCode,
    discountError,
    onDiscountCodeChange,
    onApplyDiscount,
    onRemoveDiscount
}: DiscountInputProps) {
    if (appliedDiscount) {
        return (
            <div
                className="flex items-center justify-between p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
                data-testid="applied-discount"
            >
                <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <div>
                        <p className="text-sm font-medium text-emerald-400" data-testid="discount-code">{appliedDiscount.code}</p>
                        <p className="text-xs text-slate-400">{appliedDiscount.name}</p>
                    </div>
                </div>
                <button
                    onClick={onRemoveDiscount}
                    className="p-1 hover:bg-slate-700 rounded"
                    data-testid="remove-discount-button"
                >
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            </div>
        )
    }

    return (
        <div data-testid="discount-input">
            <div className="flex gap-2">
                <input
                    type="text"
                    className="input text-sm py-2 flex-1 uppercase"
                    placeholder="Kode diskon..."
                    value={discountCode}
                    onChange={(e) => onDiscountCodeChange(e.target.value.toUpperCase())}
                    data-testid="discount-code-input"
                />
                <button
                    className="btn btn-secondary px-3"
                    onClick={onApplyDiscount}
                    data-testid="apply-discount-button"
                >
                    Terapkan
                </button>
            </div>
            {discountError && (
                <p className="text-xs text-red-400 mt-1" data-testid="discount-error">{discountError}</p>
            )}
        </div>
    )
}
