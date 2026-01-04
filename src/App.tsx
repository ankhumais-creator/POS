import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { initializeSync } from '@/lib/sync'
import { seedDemoData } from '@/lib/seed'

// Pages - Static imports (more stable for PWA)
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import POSPage from '@/pages/POSPage'
import ProductsPage from '@/pages/ProductsPage'
import CategoriesPage from '@/pages/CategoriesPage'
import TransactionsPage from '@/pages/TransactionsPage'
import ReportsPage from '@/pages/ReportsPage'
import UsersPage from '@/pages/UsersPage'
import SettingsPage from '@/pages/SettingsPage'
import CustomersPage from '@/pages/CustomersPage'
import ShiftsPage from '@/pages/ShiftsPage'
import StockOpnamePage from '@/pages/StockOpnamePage'
import DiscountsPage from '@/pages/DiscountsPage'

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Memuat...</p>
      </div>
    </div>
  )
}

// Protected Route component
function ProtectedRoute({ children }: { readonly children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true)
  const setLoading = useAuthStore((state) => state.setLoading)

  useEffect(() => {
    const init = async () => {
      try {
        await seedDemoData()
        await initializeSync()
        setLoading(false)
      } catch (error) {
        console.error('Init error:', error)
      } finally {
        setIsInitializing(false)
      }
    }
    init()
  }, [setLoading])

  if (isInitializing) {
    return <LoadingScreen />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/pos" element={<ProtectedRoute><POSPage /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/shifts" element={<ProtectedRoute><ShiftsPage /></ProtectedRoute>} />
        <Route path="/stock-opname" element={<ProtectedRoute><StockOpnamePage /></ProtectedRoute>} />
        <Route path="/discounts" element={<ProtectedRoute><DiscountsPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
