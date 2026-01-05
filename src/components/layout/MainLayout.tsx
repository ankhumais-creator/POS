import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
    LayoutDashboard, ShoppingCart, Package, FolderOpen,
    Receipt, BarChart3, Settings, LogOut, Users, Clock,
    Tag, ClipboardList, UserCircle, History, Menu, X
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import NotificationBell from '@/components/NotificationBell'

interface MainLayoutProps {
    readonly children: React.ReactNode
    readonly title?: string
}

const menuItems = [
    { path: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
    { path: '/pos', icon: ShoppingCart, labelKey: 'nav.pos' },
    { path: '/products', icon: Package, labelKey: 'nav.products' },
    { path: '/categories', icon: FolderOpen, labelKey: 'nav.categories' },
    { path: '/customers', icon: UserCircle, labelKey: 'nav.customers' },
    { path: '/transactions', icon: Receipt, labelKey: 'nav.transactions' },
    { path: '/reports', icon: BarChart3, labelKey: 'nav.reports' },
    { path: '/shifts', icon: Clock, labelKey: 'nav.shifts' },
    { path: '/stock-opname', icon: ClipboardList, labelKey: 'nav.stockOpname' },
    { path: '/discounts', icon: Tag, labelKey: 'nav.discounts' },
    { path: '/activity-log', icon: History, labelKey: 'nav.activityLog' },
    { path: '/users', icon: Users, labelKey: 'nav.users' },
    { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
]

export default function MainLayout({ children, title }: MainLayoutProps) {
    const { t, i18n } = useTranslation()
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
                    role="button"
                    tabIndex={0}
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsDrawerOpen(false)}
                    onKeyDown={(e) => e.key === 'Escape' && setIsDrawerOpen(false)}
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
                                {t(item.labelKey)}
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
                    {/* Language Switcher */}
                    <div className="flex gap-1 mb-2 px-1">
                        <button
                            onClick={() => i18n.changeLanguage('id')}
                            className={`flex-1 px-2 py-1 rounded text-xs ${i18n.language === 'id' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                            ID
                        </button>
                        <button
                            onClick={() => i18n.changeLanguage('en')}
                            className={`flex-1 px-2 py-1 rounded text-xs ${i18n.language === 'en' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                            EN
                        </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
                    >
                        <LogOut className="w-4 h-4" />
                        {t('nav.logout')}
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
