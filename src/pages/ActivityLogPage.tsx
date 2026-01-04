import { useState, useEffect } from 'react'
import { History, User, Package, ShoppingCart, Tag, Users, Settings, RefreshCw, Filter } from 'lucide-react'
import { getActivityLogs } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import type { ActivityLog } from '@/types'
import MainLayout from '@/components/layout/MainLayout'

const actionIcons: Record<string, typeof History> = {
    login: User,
    logout: User,
    transaction: ShoppingCart,
    void_transaction: ShoppingCart,
    product_add: Package,
    product_edit: Package,
    product_delete: Package,
    category_add: Tag,
    category_edit: Tag,
    category_delete: Tag,
    stock_adjust: Package,
    discount_add: Tag,
    discount_edit: Tag,
    customer_add: Users,
    customer_edit: Users,
    shift_open: History,
    shift_close: History,
    settings_update: Settings,
    other: History
}

const actionColors: Record<string, string> = {
    login: 'text-green-400',
    logout: 'text-slate-400',
    transaction: 'text-blue-400',
    void_transaction: 'text-red-400',
    product_add: 'text-emerald-400',
    product_edit: 'text-amber-400',
    product_delete: 'text-red-400',
    category_add: 'text-emerald-400',
    category_edit: 'text-amber-400',
    category_delete: 'text-red-400',
    stock_adjust: 'text-purple-400',
    discount_add: 'text-emerald-400',
    discount_edit: 'text-amber-400',
    customer_add: 'text-emerald-400',
    customer_edit: 'text-amber-400',
    shift_open: 'text-green-400',
    shift_close: 'text-orange-400',
    settings_update: 'text-blue-400',
    other: 'text-slate-400'
}

const actionLabels: Record<string, string> = {
    login: 'Login',
    logout: 'Logout',
    transaction: 'Transaksi',
    void_transaction: 'Void Transaksi',
    product_add: 'Tambah Produk',
    product_edit: 'Edit Produk',
    product_delete: 'Hapus Produk',
    category_add: 'Tambah Kategori',
    category_edit: 'Edit Kategori',
    category_delete: 'Hapus Kategori',
    stock_adjust: 'Penyesuaian Stok',
    discount_add: 'Tambah Diskon',
    discount_edit: 'Edit Diskon',
    customer_add: 'Tambah Pelanggan',
    customer_edit: 'Edit Pelanggan',
    shift_open: 'Buka Shift',
    shift_close: 'Tutup Shift',
    settings_update: 'Update Pengaturan',
    other: 'Lainnya'
}

export default function ActivityLogPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [filterAction, setFilterAction] = useState<string>('all')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadLogs()
    }, [])

    const loadLogs = async () => {
        setIsLoading(true)
        try {
            const data = await getActivityLogs(200)
            setLogs(data)
        } catch (error) {
            console.error('Error loading activity logs:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredLogs = filterAction === 'all'
        ? logs
        : logs.filter(log => log.action === filterAction)

    const uniqueActions = [...new Set(logs.map(log => log.action))]

    return (
        <MainLayout title="Activity Log">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <p className="text-slate-400">{filteredLogs.length} aktivitas tercatat</p>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <select
                                className="input py-1.5 text-sm"
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                            >
                                <option value="all">Semua Aktivitas</option>
                                {uniqueActions.map(action => (
                                    <option key={action} value={action}>
                                        {actionLabels[action] || action}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            className="btn btn-secondary"
                            onClick={loadLogs}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Log List */}
                <div className="card overflow-hidden">
                    {filteredLogs.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Belum ada aktivitas tercatat</p>
                            <p className="text-sm mt-1">Aktivitas akan muncul setelah pengguna melakukan aksi</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700/50">
                            {filteredLogs.map(log => {
                                const Icon = actionIcons[log.action] || History
                                const colorClass = actionColors[log.action] || 'text-slate-400'

                                return (
                                    <div key={log.id} className="p-4 hover:bg-slate-800/50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2 rounded-lg bg-slate-800 ${colorClass}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`text-sm font-medium ${colorClass}`}>
                                                        {actionLabels[log.action] || log.action}
                                                    </span>
                                                    {log.entity_name && (
                                                        <span className="text-sm text-slate-400">
                                                            - {log.entity_name}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-300 mt-0.5">{log.description}</p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {log.user_name}
                                                    </span>
                                                    <span>{formatDate(log.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    )
}
