import { X, Printer, Share2, Check } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction, TransactionItem, StoreSettings } from '@/types'

interface ReceiptProps {
    transaction: Transaction
    items: TransactionItem[]
    settings: StoreSettings | null
    onClose: () => void
}

export default function Receipt({ transaction, items, settings, onClose }: ReceiptProps) {
    const handlePrint = () => {
        window.print()
    }

    const handleShare = async () => {
        const receiptText = `
🧾 ${settings?.name || 'Toko'}
${settings?.address || ''}

No: ${transaction.transaction_number}
Tanggal: ${formatDate(transaction.created_at)}

${items.map(item => `${item.product_name} x${item.quantity} = ${formatCurrency(item.subtotal)}`).join('\n')}

Total: ${formatCurrency(transaction.total)}
Bayar: ${formatCurrency(transaction.payment_amount)}
Kembali: ${formatCurrency(transaction.change_amount)}

Terima kasih!
    `.trim()

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Struk ${transaction.transaction_number}`,
                    text: receiptText
                })
            } catch (err) {
                // Share cancelled
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(receiptText)
            alert('Struk disalin ke clipboard!')
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-400" />
                        Transaksi Berhasil
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Receipt Preview */}
                <div className="p-4">
                    <div className="bg-white text-slate-900 rounded-lg p-4 text-sm font-mono" id="receipt-content">
                        {/* Header */}
                        <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
                            <p className="font-bold text-base">{settings?.name || 'TOKO'}</p>
                            <p className="text-xs text-slate-600">{settings?.address || ''}</p>
                            <p className="text-xs text-slate-600">{settings?.phone || ''}</p>
                        </div>

                        {/* Transaction Info */}
                        <div className="border-b border-dashed border-slate-300 pb-3 mb-3 text-xs">
                            <div className="flex justify-between">
                                <span>No:</span>
                                <span>{transaction.transaction_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tanggal:</span>
                                <span>{formatDate(transaction.created_at)}</span>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="border-b border-dashed border-slate-300 pb-3 mb-3 space-y-1">
                            {items.map(item => (
                                <div key={item.id}>
                                    <p>{item.product_name}</p>
                                    <div className="flex justify-between text-xs text-slate-600">
                                        <span>{item.quantity} x {formatCurrency(item.price).replace('Rp', '')}</span>
                                        <span>{formatCurrency(item.subtotal).replace('Rp', '')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatCurrency(transaction.subtotal).replace('Rp', '')}</span>
                            </div>
                            {transaction.discount > 0 && (
                                <div className="flex justify-between">
                                    <span>Diskon</span>
                                    <span>-{formatCurrency(transaction.discount).replace('Rp', '')}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-300">
                                <span>TOTAL</span>
                                <span>{formatCurrency(transaction.total).replace('Rp', '')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{transaction.payment_method === 'cash' ? 'Tunai' : transaction.payment_method.toUpperCase()}</span>
                                <span>{formatCurrency(transaction.payment_amount).replace('Rp', '')}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span>Kembali</span>
                                <span>{formatCurrency(transaction.change_amount).replace('Rp', '')}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center mt-4 pt-3 border-t border-dashed border-slate-300">
                            <p className="text-xs">*** TERIMA KASIH ***</p>
                            <p className="text-xs text-slate-500 mt-1">{settings?.receipt_footer || 'Barang yang sudah dibeli tidak dapat dikembalikan'}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="modal-footer">
                    <button className="btn btn-secondary flex-1" onClick={handlePrint}>
                        <Printer className="w-4 h-4" />
                        Cetak
                    </button>
                    <button className="btn btn-secondary flex-1" onClick={handleShare}>
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                    <button className="btn btn-primary flex-1" onClick={onClose}>
                        Selesai
                    </button>
                </div>
            </div>
        </div>
    )
}
