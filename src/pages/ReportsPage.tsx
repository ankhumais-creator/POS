import { useState, useEffect } from 'react'
import { BarChart3, Download, FileSpreadsheet, FileText } from 'lucide-react'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { exportToExcel, exportToCSV } from '@/lib/export'
import { useSettingsStore } from '@/stores/settingsStore'
import type { Transaction, TransactionItem } from '@/types'
import MainLayout from '@/components/layout/MainLayout'

interface TopProduct {
    name: string
    quantity: number
    sales: number
}

interface DailyData {
    date: string
    sales: number
    transactions: number
}

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState('week')
    const [dailyData, setDailyData] = useState<DailyData[]>([])
    const [topProducts, setTopProducts] = useState<TopProduct[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [itemsMap, setItemsMap] = useState<Map<string, TransactionItem[]>>(new Map())
    const [showExportMenu, setShowExportMenu] = useState(false)
    const [summary, setSummary] = useState({
        totalSales: 0,
        totalTransactions: 0,
        totalItems: 0,
        averageTransaction: 0
    })

    const settings = useSettingsStore((state) => state.settings)

    useEffect(() => {
        loadReportData()
    }, [dateRange])

    const loadReportData = async () => {
        const now = new Date()
        let startDate = new Date()

        if (dateRange === 'today') {
            startDate.setHours(0, 0, 0, 0)
        } else if (dateRange === 'week') {
            startDate.setDate(now.getDate() - 7)
        } else if (dateRange === 'month') {
            startDate.setMonth(now.getMonth() - 1)
        } else if (dateRange === 'year') {
            startDate.setFullYear(now.getFullYear() - 1)
        }
        startDate.setHours(0, 0, 0, 0)

        // Get transactions in range
        const txs = await db.transactions
            .filter(t => new Date(t.created_at) >= startDate && t.status === 'completed')
            .toArray()
        setTransactions(txs)

        // Get all transaction items
        const items = new Map<string, TransactionItem[]>()
        for (const tx of txs) {
            const txItems = await db.transactionItems.where('transaction_id').equals(tx.id).toArray()
            items.set(tx.id, txItems)
        }
        setItemsMap(items)

        // Calculate daily data
        const dailyMap = new Map<string, DailyData>()
        for (const tx of txs) {
            const date = new Date(tx.created_at).toISOString().split('T')[0]
            const existing = dailyMap.get(date) || { date, sales: 0, transactions: 0 }
            existing.sales += tx.total
            existing.transactions += 1
            dailyMap.set(date, existing)
        }
        setDailyData(Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)))

        // Calculate top products
        const productMap = new Map<string, TopProduct>()
        for (const [, txItems] of items) {
            for (const item of txItems) {
                const existing = productMap.get(item.product_id) || { name: item.product_name, quantity: 0, sales: 0 }
                existing.quantity += item.quantity
                existing.sales += item.subtotal
                productMap.set(item.product_id, existing)
            }
        }
        const sortedProducts = Array.from(productMap.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 10)
        setTopProducts(sortedProducts)

        // Calculate summary
        const totalSales = txs.reduce((sum, t) => sum + t.total, 0)
        const totalItems = sortedProducts.reduce((sum, p) => sum + p.quantity, 0)
        setSummary({
            totalSales,
            totalTransactions: txs.length,
            totalItems,
            averageTransaction: txs.length > 0 ? totalSales / txs.length : 0
        })
    }

    const getDateRange = () => {
        const now = new Date()
        let startDate = new Date()

        if (dateRange === 'today') {
            startDate.setHours(0, 0, 0, 0)
        } else if (dateRange === 'week') {
            startDate.setDate(now.getDate() - 7)
        } else if (dateRange === 'month') {
            startDate.setMonth(now.getMonth() - 1)
        } else {
            startDate.setFullYear(now.getFullYear() - 1)
        }

        return { startDate, endDate: now }
    }

    const handleExportExcel = () => {
        const { startDate, endDate } = getDateRange()
        exportToExcel({
            transactions,
            items: itemsMap,
            startDate,
            endDate,
            storeName: settings?.name || 'Toko'
        })
        setShowExportMenu(false)
    }

    const handleExportCSV = () => {
        const { startDate, endDate } = getDateRange()
        exportToCSV({
            transactions,
            items: itemsMap,
            startDate,
            endDate,
            storeName: settings?.name || 'Toko'
        })
        setShowExportMenu(false)
    }

    const maxSales = Math.max(...dailyData.map(d => d.sales), 1)

    return (
        <MainLayout title="Laporan Penjualan">
            <div className="space-y-6">
                {/* Period Selector */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        {[
                            { value: 'today', label: 'Hari Ini' },
                            { value: 'week', label: '7 Hari' },
                            { value: 'month', label: '30 Hari' },
                            { value: 'year', label: '1 Tahun' },
                        ].map(opt => (
                            <button
                                key={opt.value}
                                className={`px-3 py-1.5 rounded-lg text-sm ${dateRange === opt.value
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                                onClick={() => setDateRange(opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowExportMenu(!showExportMenu)}
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>

                        {showExportMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                                    <button
                                        className="w-full p-3 text-left hover:bg-slate-700 flex items-center gap-3"
                                        onClick={handleExportExcel}
                                    >
                                        <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                                        <div>
                                            <p className="font-medium">Excel (.xlsx)</p>
                                            <p className="text-xs text-slate-400">Dengan multiple sheet</p>
                                        </div>
                                    </button>
                                    <button
                                        className="w-full p-3 text-left hover:bg-slate-700 flex items-center gap-3"
                                        onClick={handleExportCSV}
                                    >
                                        <FileText className="w-5 h-5 text-blue-400" />
                                        <div>
                                            <p className="font-medium">CSV</p>
                                            <p className="text-xs text-slate-400">Format sederhana</p>
                                        </div>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card p-4">
                        <p className="text-sm text-slate-400">Total Penjualan</p>
                        <p className="text-2xl font-bold text-blue-400">{formatCurrency(summary.totalSales)}</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-sm text-slate-400">Total Transaksi</p>
                        <p className="text-2xl font-bold">{summary.totalTransactions}</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-sm text-slate-400">Produk Terjual</p>
                        <p className="text-2xl font-bold">{summary.totalItems}</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-sm text-slate-400">Rata-rata Transaksi</p>
                        <p className="text-2xl font-bold">{formatCurrency(summary.averageTransaction)}</p>
                    </div>
                </div>

                {/* Sales Chart */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-semibold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-400" />
                            Grafik Penjualan
                        </h3>
                    </div>
                    <div className="card-body">
                        {dailyData.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">Belum ada data penjualan</p>
                        ) : (
                            <div className="flex items-end gap-1 h-48 overflow-x-auto">
                                {dailyData.map((day, index) => (
                                    <div key={index} className="flex-1 min-w-[24px] flex flex-col items-center gap-1">
                                        <div
                                            className="w-full bg-blue-500 rounded-t hover:bg-blue-400"
                                            style={{ height: `${(day.sales / maxSales) * 100}%`, minHeight: '4px' }}
                                            title={`${formatCurrency(day.sales)} - ${day.transactions} transaksi`}
                                        />
                                        <p className="text-[10px] text-slate-500 text-center">
                                            {new Date(day.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-semibold">Produk Terlaris</h3>
                    </div>
                    <div className="card-body p-0">
                        {topProducts.length === 0 ? (
                            <p className="text-center text-slate-500 p-8">Belum ada data produk</p>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left p-4 text-sm font-medium text-slate-400">#</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-400">Produk</th>
                                        <th className="text-center p-4 text-sm font-medium text-slate-400">Qty</th>
                                        <th className="text-right p-4 text-sm font-medium text-slate-400">Total Penjualan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topProducts.map((product, index) => (
                                        <tr key={index} className="border-b border-slate-700/50">
                                            <td className="p-4 text-slate-500">{index + 1}</td>
                                            <td className="p-4 font-medium">{product.name}</td>
                                            <td className="p-4 text-center">
                                                <span className="badge badge-primary">{product.quantity}×</span>
                                            </td>
                                            <td className="p-4 text-right text-blue-400 font-semibold">
                                                {formatCurrency(product.sales)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
