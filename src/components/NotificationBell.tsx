import { useState, useEffect, useCallback } from 'react'
import { Bell, X, Package, Clock, Tag, AlertCircle, Check } from 'lucide-react'
import { db, checkLowStock } from '@/lib/db'
import { generateId } from '@/lib/utils'
import type { AppNotification } from '@/types'

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<AppNotification[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const unreadCount = notifications.filter(n => !n.is_read).length

    const loadNotifications = useCallback(async () => {
        const notifs = await db.notifications.orderBy('created_at').reverse().limit(10).toArray()
        setNotifications(notifs)
    }, [])

    const checkAndCreateLowStockNotifications = useCallback(async () => {
        const lowStockProducts = await checkLowStock()

        for (const product of lowStockProducts) {
            // Check if notification already exists for this product today
            const today = new Date().toISOString().split('T')[0]
            const existing = await db.notifications
                .where('type')
                .equals('low_stock')
                .filter(n =>
                    n.created_at.startsWith(today) &&
                    (n.data as { product_id?: string })?.product_id === product.id
                )
                .first()

            if (!existing) {
                const notif: AppNotification = {
                    id: generateId(),
                    type: 'low_stock',
                    title: 'Stok Menipis',
                    message: `${product.name} tersisa ${product.stock} unit`,
                    is_read: false,
                    data: { product_id: product.id, stock: product.stock },
                    created_at: new Date().toISOString()
                }
                await db.notifications.add(notif)
            }
        }

        loadNotifications()
    }, [loadNotifications])

    useEffect(() => {
        loadNotifications()
        checkAndCreateLowStockNotifications()

        // Check every 5 minutes
        const interval = setInterval(checkAndCreateLowStockNotifications, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [loadNotifications, checkAndCreateLowStockNotifications])

    const markAsRead = async (id: string) => {
        await db.notifications.update(id, { is_read: true })
        loadNotifications()
    }

    const markAllAsRead = async () => {
        const unread = notifications.filter(n => !n.is_read)
        for (const n of unread) {
            await db.notifications.update(n.id, { is_read: true })
        }
        loadNotifications()
    }

    const deleteNotification = async (id: string) => {
        await db.notifications.delete(id)
        loadNotifications()
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'low_stock': return <Package className="w-4 h-4 text-amber-400" />
            case 'shift_reminder': return <Clock className="w-4 h-4 text-blue-400" />
            case 'promo': return <Tag className="w-4 h-4 text-emerald-400" />
            default: return <AlertCircle className="w-4 h-4 text-slate-400" />
        }
    }

    const getTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'Baru saja'
        if (minutes < 60) return `${minutes} menit lalu`
        if (hours < 24) return `${hours} jam lalu`
        return `${days} hari lalu`
    }

    return (
        <div className="relative">
            <button
                className="p-2 rounded-lg hover:bg-slate-700/50 relative"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <Bell className="w-5 h-5 text-slate-400" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <button type="button" className="fixed inset-0 z-40 cursor-default bg-transparent border-0" onClick={() => setShowDropdown(false)} aria-label="Close notifications" />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                            <h3 className="font-semibold">Notifikasi</h3>
                            {unreadCount > 0 && (
                                <button
                                    className="text-xs text-blue-400 hover:text-blue-300"
                                    onClick={markAllAsRead}
                                >
                                    Tandai semua dibaca
                                </button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-slate-500">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Tidak ada notifikasi</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`p-3 border-b border-slate-700/50 hover:bg-slate-700/30 ${notif.is_read ? '' : 'bg-blue-500/5'
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="pt-0.5">{getIcon(notif.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">{notif.title}</p>
                                                <p className="text-xs text-slate-400 truncate">{notif.message}</p>
                                                <p className="text-xs text-slate-500 mt-1">{getTimeAgo(notif.created_at)}</p>
                                            </div>
                                            <div className="flex items-start gap-1">
                                                {notif.is_read === false && (
                                                    <button
                                                        className="p-1 rounded hover:bg-slate-700 text-emerald-400"
                                                        onClick={() => markAsRead(notif.id)}
                                                        title="Tandai dibaca"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                    </button>
                                                )}
                                                <button
                                                    className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-red-400"
                                                    onClick={() => deleteNotification(notif.id)}
                                                    title="Hapus"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
