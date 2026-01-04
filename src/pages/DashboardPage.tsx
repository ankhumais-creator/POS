import { useState, useEffect } from 'react'
import {
    TrendingUp,
    ShoppingCart,
    Package,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { formatCurrency, formatDateOnly } from '@/lib/utils'
import { db } from '@/lib/db'
import MainLayout from '@/components/layout/MainLayout'

interface SummaryCard {
    title: string
    value: string
    change: number
    icon: React.ReactNode
    color: string
}

export default function DashboardPage() {
    const [todaySales, setTodaySales] = useState(0)
    const [todayTransactions, setTodayTransactions] = useState(0)
    const [todayItems, setTodayItems] = useState(0)
    const [lowStockCount, setLowStockCount] = useState(0)
    const [recentTransactions, setRecentTransactions] = useState<any[]>([])

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Get today's transactions
        const transactions = await db.transactions
            .where('created_at')
            .aboveOrEqual(today.toISOString())
            .and(t => t.status === 'completed')
            .toArray()

        const sales = transactions.reduce((sum, t) => sum + t.total, 0)
        setTodaySales(sales)
        setTodayTransactions(transactions.length)

        // Get items sold today
        const transactionIds = transactions.map(t => t.id)
        let itemsCount = 0
        for (const txId of transactionIds) {
            const items = await db.transactionItems.where('transaction_id').equals(txId).toArray()
            itemsCount += items.reduce((sum, item) => sum + item.quantity, 0)
        }
        setTodayItems(itemsCount)

        // Get low stock products
        const lowStock = await db.products
            .filter(p => p.is_active && p.stock <= p.min_stock)
            .count()
        setLowStockCount(lowStock)

        // Get recent transactions
        const recent = await db.transactions
            .orderBy('created_at')
            .reverse()
            .limit(5)
            .toArray()
        setRecentTransactions(recent)
    }

    const summaryCards: SummaryCard[] = [
        {
            title: 'Penjualan Hari Ini',
            value: formatCurrency(todaySales),
            change: 12,
            icon: <DollarSign className="w-5 h-5" />,
            color: 'bg-blue-500'
        },
        {
            title: 'Transaksi',
            value: todayTransactions.toString(),
            change: 8,
            icon: <ShoppingCart className="w-5 h-5" />,
            color: 'bg-emerald-500'
        },
        {
            title: 'Produk Terjual',
            value: todayItems.toString(),
            change: 15,
            icon: <Package className="w-5 h-5" />,
            color: 'bg-violet-500'
        },
        {
            title: 'Stok Menipis',
            value: lowStockCount.toString(),
            change: -5,
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'bg-amber-500'
        }
    ]

    return (
        <MainLayout title="Dashboard">
            <div className="space-y-6">
                {/* Date */}
                <p className="text-slate-400">{formatDateOnly(new Date())}</p>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {summaryCards.map((card, index) => (
                        <div key={index} className="card">
                            <div className="card-body">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">{card.title}</p>
                                        <p className="text-2xl font-bold">{card.value}</p>
                                    </div>
                                    <div className={`p-2 rounded-lg ${card.color}`}>
                                        {card.icon}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 mt-2">
                                    {card.change >= 0 ? (
                                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                        <ArrowDownRight className="w-4 h-4 text-red-400" />
                                    )}
                                    <span className={`text-sm font-medium ${card.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                                        }`}>
                                        {Math.abs(card.change)}%
                                    </span>
                                    <span className="text-sm text-slate-500">vs kemarin</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Transactions */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-semibold">Transaksi Terakhir</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">No. Transaksi</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Total</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Metode</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Waktu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">
                                            Belum ada transaksi hari ini
                                        </td>
                                    </tr>
                                ) : (
                                    recentTransactions.map((tx) => (
                                        <tr key={tx.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                                            <td className="p-4 font-medium">{tx.transaction_number}</td>
                                            <td className="p-4 text-blue-400 font-semibold">{formatCurrency(tx.total)}</td>
                                            <td className="p-4">
                                                <span className="badge badge-primary capitalize">{tx.payment_method}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`badge ${tx.status === 'completed' ? 'badge-success' :
                                                        tx.status === 'voided' ? 'badge-danger' : 'badge-warning'
                                                    }`}>
                                                    {tx.status === 'completed' ? 'Selesai' :
                                                        tx.status === 'voided' ? 'Dibatalkan' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-400 text-sm">
                                                {new Date(tx.created_at).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
