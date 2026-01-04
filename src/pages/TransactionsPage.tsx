import { useState, useEffect } from 'react'
import { Search, Eye, Receipt } from 'lucide-react'
import { db } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction, TransactionItem } from '@/types'
import MainLayout from '@/components/layout/MainLayout'

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
    const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([])
    const [showDetail, setShowDetail] = useState(false)
    const [dateFilter, setDateFilter] = useState('today')

    useEffect(() => {
        loadTransactions()
    }, [dateFilter])

    const loadTransactions = async () => {
        let query = db.transactions.orderBy('created_at').reverse()

        if (dateFilter === 'today') {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            query = query.filter(t => new Date(t.created_at) >= today)
        } else if (dateFilter === 'week') {
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            query = query.filter(t => new Date(t.created_at) >= weekAgo)
        } else if (dateFilter === 'month') {
            const monthAgo = new Date()
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            query = query.filter(t => new Date(t.created_at) >= monthAgo)
        }

        const txs = await query.toArray()
        setTransactions(txs)
    }

    const handleViewTransaction = async (transaction: Transaction) => {
        const items = await db.transactionItems
            .where('transaction_id')
            .equals(transaction.id)
            .toArray()

        setSelectedTransaction(transaction)
        setTransactionItems(items)
        setShowDetail(true)
    }

    const filteredTransactions = transactions.filter(t =>
        t.transaction_number.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalSales = filteredTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.total, 0)

    return (
        <MainLayout title="Riwayat Transaksi">
            <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 relative min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                        <input
                            type="text"
                            className="input"
                            style={{ paddingLeft: '2.5rem' }}
                            placeholder="Cari no. transaksi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <select
                        className="input w-auto"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    >
                        <option value="today">Hari Ini</option>
                        <option value="week">7 Hari Terakhir</option>
                        <option value="month">30 Hari Terakhir</option>
                        <option value="all">Semua</option>
                    </select>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="card p-4">
                        <p className="text-sm text-slate-400">Total Transaksi</p>
                        <p className="text-2xl font-bold">{filteredTransactions.length}</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-sm text-slate-400">Total Penjualan</p>
                        <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalSales)}</p>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700 bg-slate-800/50">
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">No. Transaksi</th>
                                    <th className="text-right p-4 text-sm font-medium text-slate-400">Total</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Metode</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Status</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Sync</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Waktu</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-500">
                                            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>Belum ada transaksi</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map(tx => (
                                        <tr
                                            key={tx.id}
                                            className="border-b border-slate-700/50 hover:bg-slate-800/50"
                                        >
                                            <td className="p-4 font-mono text-sm">{tx.transaction_number}</td>
                                            <td className="p-4 text-right text-blue-400 font-semibold">
                                                {formatCurrency(tx.total)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="badge badge-primary capitalize">{tx.payment_method}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`badge ${tx.status === 'completed' ? 'badge-success' :
                                                    tx.status === 'voided' ? 'badge-danger' : 'badge-warning'
                                                    }`}>
                                                    {tx.status === 'completed' ? 'Selesai' :
                                                        tx.status === 'voided' ? 'Dibatalkan' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`w-2 h-2 rounded-full inline-block ${tx.synced ? 'bg-emerald-400' : 'bg-amber-400'
                                                    }`} title={tx.synced ? 'Synced' : 'Pending sync'} />
                                            </td>
                                            <td className="p-4 text-slate-400 text-sm">
                                                {formatDate(tx.created_at)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                                    onClick={() => handleViewTransaction(tx)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetail && selectedTransaction && (
                <div className="modal-overlay" onClick={() => setShowDetail(false)}>
                    <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="text-lg font-semibold">Detail Transaksi</h3>
                            <button
                                onClick={() => setShowDetail(false)}
                                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400"
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-400">No. Transaksi</p>
                                    <p className="font-mono">{selectedTransaction.transaction_number}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Waktu</p>
                                    <p>{formatDate(selectedTransaction.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Metode</p>
                                    <p className="capitalize">{selectedTransaction.payment_method}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Status</p>
                                    <span className={`badge ${selectedTransaction.status === 'completed' ? 'badge-success' : 'badge-danger'
                                        }`}>
                                        {selectedTransaction.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                                    </span>
                                </div>
                            </div>

                            <hr className="border-slate-700" />

                            <div className="space-y-2">
                                {transactionItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span>{item.product_name} × {item.quantity}</span>
                                        <span>{formatCurrency(item.subtotal)}</span>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-slate-700" />

                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Subtotal</span>
                                    <span>{formatCurrency(selectedTransaction.subtotal)}</span>
                                </div>
                                {selectedTransaction.discount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Diskon</span>
                                        <span className="text-red-400">-{formatCurrency(selectedTransaction.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-base pt-2">
                                    <span>Total</span>
                                    <span className="text-blue-400">{formatCurrency(selectedTransaction.total)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Dibayar</span>
                                    <span>{formatCurrency(selectedTransaction.payment_amount)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Kembalian</span>
                                    <span>{formatCurrency(selectedTransaction.change_amount)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary flex-1" onClick={() => setShowDetail(false)}>
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    )
}
