import { useState } from 'react'
import { X, Banknote, QrCode, CreditCard, Loader2 } from 'lucide-react'
import { db, addToSyncQueue, getCurrentShift } from '@/lib/db'
import { formatCurrency, generateId, generateTransactionNumber } from '@/lib/utils'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import type { Transaction, TransactionItem, Customer } from '@/types'

interface PaymentModalProps {
    readonly onClose: () => void
    readonly onComplete: (transaction: Transaction & { items: TransactionItem[] }) => void
    readonly customer?: Customer | null
    readonly discountCode?: string
}

const paymentMethods = [
    { id: 'cash', label: 'Tunai', icon: Banknote, color: 'emerald' },
    { id: 'qris', label: 'QRIS', icon: QrCode, color: 'blue' },
    { id: 'transfer', label: 'Transfer', icon: CreditCard, color: 'purple' },
]

export default function PaymentModal({ onClose, onComplete, customer, discountCode }: PaymentModalProps) {
    const { items, subtotal, discount, total } = useCartStore()
    const user = useAuthStore((state) => state.user)

    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'transfer'>('cash')
    const [paymentAmount, setPaymentAmount] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    const amount = Number.parseFloat(paymentAmount) || 0
    const change = Math.max(0, amount - total)
    const canPay = paymentMethod !== 'cash' || amount >= total

    const quickAmounts = [
        { label: 'Uang Pas', value: total },
        { label: '10rb', value: 10000 },
        { label: '20rb', value: 20000 },
        { label: '50rb', value: 50000 },
        { label: '100rb', value: 100000 },
    ]

    const handlePayment = async () => {
        if (!user || isProcessing) return

        setIsProcessing(true)

        try {
            const transactionId = generateId()
            const transactionNumber = generateTransactionNumber()
            const now = new Date().toISOString()

            // Get current shift
            const shift = await getCurrentShift(user.id)

            // Create transaction
            const transaction: Transaction = {
                id: transactionId,
                transaction_number: transactionNumber,
                cashier_id: user.id,
                customer_id: customer?.id,
                shift_id: shift?.id,
                subtotal,
                discount,
                discount_code: discountCode,
                total,
                payment_method: paymentMethod,
                payment_amount: paymentMethod === 'cash' ? amount : total,
                change_amount: paymentMethod === 'cash' ? change : 0,
                status: 'completed',
                synced: false,
                created_at: now
            }

            // Create transaction items
            const transactionItems: TransactionItem[] = items.map(item => ({
                id: generateId(),
                transaction_id: transactionId,
                product_id: item.product_id,
                product_name: item.product_name,
                price: item.price,
                quantity: item.quantity,
                discount: item.discount,
                subtotal: item.subtotal
            }))

            // Save to IndexedDB
            await db.transactions.add(transaction)
            await db.transactionItems.bulkAdd(transactionItems)

            // Update product stock
            for (const item of items) {
                await db.products.where('id').equals(item.product_id).modify(p => {
                    p.stock = Math.max(0, p.stock - item.quantity)
                    p.updated_at = now
                })
            }

            // Update shift totals
            if (shift) {
                await db.shifts.update(shift.id, {
                    total_sales: shift.total_sales + total,
                    total_transactions: shift.total_transactions + 1
                })
            }

            // Update customer stats
            if (customer) {
                await db.customers.update(customer.id, {
                    total_spent: customer.total_spent + total,
                    visit_count: customer.visit_count + 1,
                    points: customer.points + Math.floor(total / 10000), // 1 point per 10k
                    updated_at: now
                })
            }

            // Update discount usage
            if (discountCode) {
                const discountRecord = await db.discounts.where('code').equals(discountCode).first()
                if (discountRecord) {
                    await db.discounts.update(discountRecord.id, {
                        used_count: discountRecord.used_count + 1
                    })
                }
            }

            // Add to sync queue
            await addToSyncQueue('transactions', 'insert', transaction)
            for (const item of transactionItems) {
                await addToSyncQueue('transaction_items', 'insert', item)
            }

            onComplete({ ...transaction, items: transactionItems })
        } catch (error) {
            console.error('Payment error:', error)
            alert('Gagal memproses pembayaran')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="text-lg font-semibold">Pembayaran</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="modal-body space-y-4">
                    {/* Order Summary */}
                    <div className="p-3 bg-slate-800/50 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Subtotal ({items.length} item)</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Diskon {discountCode && `(${discountCode})`}</span>
                                <span className="text-red-400">-{formatCurrency(discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-700">
                            <span>Total</span>
                            <span className="text-blue-400">{formatCurrency(total)}</span>
                        </div>
                    </div>

                    {/* Customer Info */}
                    {customer && (
                        <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm">
                            <span className="text-blue-400">Pelanggan:</span> {customer.name}
                        </div>
                    )}

                    {/* Payment Method */}
                    <div>
                        <p className="text-sm font-medium text-slate-400 mb-2">Metode Pembayaran</p>
                        <div className="grid grid-cols-3 gap-2">
                            {paymentMethods.map(method => (
                                <button
                                    key={method.id}
                                    className={`p-3 rounded-lg border text-center ${paymentMethod === method.id
                                        ? `bg-${method.color}-500 border-${method.color}-500`
                                        : 'border-slate-700 hover:border-slate-600'
                                        }`}
                                    onClick={() => setPaymentMethod(method.id as any)}
                                >
                                    <method.icon className="w-5 h-5 mx-auto mb-1" />
                                    <span className="text-xs">{method.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Payment Amount (for cash) */}
                    {paymentMethod === 'cash' && (
                        <div>
                            <p className="text-sm font-medium text-slate-400 mb-2">Jumlah Bayar</p>
                            <input
                                type="number"
                                className="input text-xl text-center font-bold"
                                placeholder="0"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                autoFocus
                            />

                            <div className="flex flex-wrap gap-2 mt-3">
                                {quickAmounts.map((qa, i) => (
                                    <button
                                        key={i}
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm"
                                        onClick={() => setPaymentAmount(qa.value.toString())}
                                    >
                                        {qa.label === 'Uang Pas' ? qa.label : formatCurrency(qa.value)}
                                    </button>
                                ))}
                            </div>

                            {amount >= total && (
                                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                                    <p className="text-sm text-slate-400">Kembalian</p>
                                    <p className="text-2xl font-bold text-emerald-400">{formatCurrency(change)}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* QRIS placeholder */}
                    {paymentMethod === 'qris' && (
                        <div className="p-6 bg-slate-800/50 rounded-lg text-center">
                            <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-3 flex items-center justify-center">
                                <QrCode className="w-24 h-24 text-slate-900" />
                            </div>
                            <p className="text-sm text-slate-400">Scan QR Code untuk pembayaran</p>
                        </div>
                    )}

                    {/* Transfer placeholder */}
                    {paymentMethod === 'transfer' && (
                        <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                            <p className="font-mono text-lg mb-1">1234-5678-9012</p>
                            <p className="text-sm text-slate-400">Bank BCA a/n Toko</p>
                            <p className="text-sm text-slate-400 mt-2">Transfer sebesar: {formatCurrency(total)}</p>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Batal</button>
                    <button
                        className="btn btn-primary flex-1"
                        disabled={!canPay || isProcessing}
                        onClick={handlePayment}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            `Bayar ${formatCurrency(total)}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
