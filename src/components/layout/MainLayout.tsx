import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard, ShoppingCart, Package, FolderOpen,
    Receipt, BarChart3, Settings, LogOut, Users, Clock,
    Tag, ClipboardList, UserCircle, History, Menu, X
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import NotificationBell from '@/components/NotificationBell'

interface MainLayoutProps {
    children: React.ReactNode
    title?: string
}

const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/pos', icon: ShoppingCart, label: 'Kasir' },
    { path: '/products', icon: Package, label: 'Produk' },
    { path: '/categories', icon: FolderOpen, label: 'Kategori' },
    { path: '/customers', icon: UserCircle, label: 'Pelanggan' },
    { path: '/transactions', icon: Receipt, label: 'Transaksi' },
    { path: '/reports', icon: BarChart3, label: 'Laporan' },
    { path: '/shifts', icon: Clock, label: 'Shift' },
    { path: '/stock-opname', icon: ClipboardList, label: 'Stok Opname' },
    { path: '/discounts', icon: Tag, label: 'Diskon' },
    { path: '/activity-log', icon: History, label: 'Activity Log' },
    { path: '/users', icon: Users, label: 'Pengguna' },
    { path: '/settings', icon: Settings, label: 'Pengaturan' },
]

export default function MainLayout({ children, title }: MainLayoutProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()
    const { isOnline } = useSettingsStore()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const handleNavClick = () => {
        setIsDrawerOpen(false)
    }

    return (
        <div className="flex h-screen bg-slate-950">
            {/* Mobile Overlay */}
            {isDrawerOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsDrawerOpen(false)}
                />
            )}

            {/* Sidebar - Desktop: always visible, Mobile: drawer */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-56 bg-slate-900 border-r border-slate-800 flex flex-col
                transform transition-transform duration-200 ease-in-out
                ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-blue-400">POS Kasir</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Aplikasi Penjualan</p>
                    </div>
                    {/* Close button - mobile only */}
                    <button
                        className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
                        onClick={() => setIsDrawerOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-2 overflow-y-auto">
                    {menuItems.map(item => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={handleNavClick}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm ${isActive
                                    ? 'bg-blue-500/20 text-blue-400 font-medium'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Info */}
                <div className="p-3 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium">
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.full_name || 'User'}</p>
                            <p className="text-xs text-slate-500 capitalize">{user?.role || 'kasir'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        {/* Hamburger menu - mobile only */}
                        <button
                            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
                            onClick={() => setIsDrawerOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-semibold">{title || 'Dashboard'}</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Online/Offline Indicator */}
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${isOnline
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            {isOnline ? 'Online' : 'Offline'}
                        </div>

                        {/* Notifications */}
                        <NotificationBell />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4">
                    {children}
                </main>
            </div>
        </div>
    )
}
