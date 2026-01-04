import { useState, useEffect, useCallback } from 'react'
import { Search, Barcode, Tag, UserCircle, X } from 'lucide-react'
import { db, getProductByBarcode, getDiscountByCode, getCurrentShift } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { Product, Category, Customer, Discount } from '@/types'
import MainLayout from '@/components/layout/MainLayout'
import ProductGrid from '@/components/pos/ProductGrid'
import Cart from '@/components/pos/Cart'
import PaymentModal from '@/components/pos/PaymentModal'
import Receipt from '@/components/pos/Receipt'
import BarcodeScanner from '@/components/pos/BarcodeScanner'
import MobileTabBar from '@/components/pos/MobileTabBar'

export default function POSPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [showPayment, setShowPayment] = useState(false)
    const [showReceipt, setShowReceipt] = useState(false)
    const [showScanner, setShowScanner] = useState(false)
    const [lastTransaction, setLastTransaction] = useState<any>(null)

    // Discount & Customer
    const [discountCode, setDiscountCode] = useState('')
    const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null)
    const [discountError, setDiscountError] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [showCustomerSearch, setShowCustomerSearch] = useState(false)
    const [customerSearch, setCustomerSearch] = useState('')
    const [customerResults, setCustomerResults] = useState<Customer[]>([])

    // Mobile tab state
    const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products')

    // Shift check
    const [hasActiveShift, setHasActiveShift] = useState(true)

    const { items, addItem, setDiscount, total, clearCart } = useCartStore()
    const user = useAuthStore((state) => state.user)
    const settings = useSettingsStore((state) => state.settings)

    useEffect(() => {
        loadData()
        checkShift()
    }, [])

    const loadData = async () => {
        const prods = await db.products.filter(p => p.is_active).toArray()
        setProducts(prods)

        const cats = await db.categories.orderBy('sort_order').toArray()
        setCategories(cats)
    }

    const checkShift = async () => {
        if (!user) return
        const shift = await getCurrentShift(user.id)
        setHasActiveShift(!!shift)
    }

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.barcode?.includes(searchQuery)
        const matchesCategory = !selectedCategory || p.category_id === selectedCategory
        return matchesSearch && matchesCategory
    })

    const handleAddProduct = useCallback((product: Product) => {
        addItem(product)
    }, [addItem])

    const handleBarcodeScan = async (barcode: string) => {
        setShowScanner(false)
        const product = await getProductByBarcode(barcode)
        if (product) {
            addItem(product)
        } else {
            alert(`Produk dengan barcode "${barcode}" tidak ditemukan`)
        }
    }

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return

        setDiscountError('')
        const discount = await getDiscountByCode(discountCode.trim())

        if (!discount) {
            setDiscountError('Kode tidak valid atau sudah kadaluarsa')
            return
        }

        if (discount.min_purchase && total < discount.min_purchase) {
            setDiscountError(`Min. belanja ${formatCurrency(discount.min_purchase)}`)
            return
        }

        // Calculate discount amount
        let discountAmount = 0
        if (discount.type === 'percentage') {
            discountAmount = Math.round(total * discount.value / 100)
            if (discount.max_discount && discountAmount > discount.max_discount) {
                discountAmount = discount.max_discount
            }
        } else {
            discountAmount = discount.value
        }

        setAppliedDiscount(discount)
        setDiscount(discountAmount)
        setDiscountCode('')
    }

    const handleRemoveDiscount = () => {
        setAppliedDiscount(null)
        setDiscount(0)
    }

    const handleCustomerSearch = async (query: string) => {
        setCustomerSearch(query)
        if (query.length < 2) {
            setCustomerResults([])
            return
        }
        const results = await db.customers
            .filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.phone?.includes(query))
            .limit(5)
            .toArray()
        setCustomerResults(results)
    }

    const handlePaymentComplete = (transaction: any) => {
        setLastTransaction(transaction)
        setShowPayment(false)
        setShowReceipt(true)
        setAppliedDiscount(null)
        setSelectedCustomer(null)
        clearCart()
    }

    const handleNewTransaction = () => {
        setShowReceipt(false)
        setLastTransaction(null)
    }

    if (!hasActiveShift) {
        return (
            <MainLayout title="Kasir">
                <div className="flex items-center justify-center h-[70vh]">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                            <Tag className="w-8 h-8 text-amber-400" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Shift Belum Dibuka</h2>
                        <p className="text-slate-400 mb-4">Buka shift terlebih dahulu untuk memulai transaksi</p>
                        <a href="/shifts" className="btn btn-primary">Buka Shift</a>
                    </div>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout title="Kasir">
            <div className="flex gap-4 h-[calc(100vh-7rem)] relative">
                {/* Left - Products */}
                <div className={`flex-1 flex flex-col min-w-0 ${activeTab === 'cart' ? 'hidden md:flex' : 'flex'}`}>
                    {/* Search & Actions */}
                    <div className="flex gap-2 mb-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                            <input
                                type="text"
                                className="input"
                                style={{ paddingLeft: '2.5rem' }}
                                placeholder="Cari produk atau scan barcode..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn btn-secondary px-3"
                            onClick={() => setShowScanner(true)}
                            title="Scan Barcode"
                        >
                            <Barcode className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Categories */}
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                        <button
                            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${!selectedCategory ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                            onClick={() => setSelectedCategory(null)}
                        >
                            Semua
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${selectedCategory === cat.id
                                    ? 'text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                                style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-auto">
                        <ProductGrid products={filteredProducts} onAddProduct={handleAddProduct} />
                    </div>
                </div>

                {/* Right - Cart */}
                <div className={`w-full md:w-80 flex flex-col bg-slate-900 rounded-xl border border-slate-800 ${activeTab === 'products' ? 'hidden md:flex' : 'flex'} ${activeTab === 'cart' ? 'mb-16 md:mb-0' : ''}`}>
                    {/* Customer Selection */}
                    <div className="p-3 border-b border-slate-800">
                        {selectedCustomer ? (
                            <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <UserCircle className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <p className="text-sm font-medium">{selectedCustomer.name}</p>
                                        <p className="text-xs text-slate-400">{selectedCustomer.points} poin</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedCustomer(null)} className="p-1 hover:bg-slate-700 rounded">
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    className="input text-sm py-2"
                                    placeholder="Pilih pelanggan (opsional)..."
                                    value={customerSearch}
                                    onChange={(e) => handleCustomerSearch(e.target.value)}
                                    onFocus={() => setShowCustomerSearch(true)}
                                />
                                {showCustomerSearch && customerResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
                                        {customerResults.map(c => (
                                            <button
                                                key={c.id}
                                                className="w-full p-2 text-left hover:bg-slate-700 text-sm"
                                                onClick={() => {
                                                    setSelectedCustomer(c)
                                                    setCustomerSearch('')
                                                    setCustomerResults([])
                                                    setShowCustomerSearch(false)
                                                }}
                                            >
                                                <p className="font-medium">{c.name}</p>
                                                <p className="text-xs text-slate-400">{c.phone}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-auto">
                        <Cart />
                    </div>

                    {/* Discount Code */}
                    <div className="p-3 border-t border-slate-800">
                        {appliedDiscount ? (
                            <div className="flex items-center justify-between p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-emerald-400" />
                                    <div>
                                        <p className="text-sm font-medium text-emerald-400">{appliedDiscount.code}</p>
                                        <p className="text-xs text-slate-400">{appliedDiscount.name}</p>
                                    </div>
                                </div>
                                <button onClick={handleRemoveDiscount} className="p-1 hover:bg-slate-700 rounded">
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="input text-sm py-2 flex-1 uppercase"
                                        placeholder="Kode diskon..."
                                        value={discountCode}
                                        onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError('') }}
                                    />
                                    <button className="btn btn-secondary px-3" onClick={handleApplyDiscount}>
                                        Terapkan
                                    </button>
                                </div>
                                {discountError && <p className="text-xs text-red-400 mt-1">{discountError}</p>}
                            </div>
                        )}
                    </div>

                    {/* Pay Button */}
                    <div className="p-3 border-t border-slate-800">
                        <button
                            className="btn btn-primary w-full py-3 text-lg"
                            disabled={items.length === 0}
                            onClick={() => setShowPayment(true)}
                        >
                            Bayar
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Tab Bar */}
            <MobileTabBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                itemCount={items.length}
                total={total}
            />

            {/* Modals */}
            {showScanner && (
                <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />
            )}

            {showPayment && (
                <PaymentModal
                    onClose={() => setShowPayment(false)}
                    onComplete={handlePaymentComplete}
                    customer={selectedCustomer}
                    discountCode={appliedDiscount?.code}
                />
            )}

            {showReceipt && lastTransaction && (
                <Receipt
                    transaction={lastTransaction}
                    items={lastTransaction.items}
                    settings={settings}
                    onClose={handleNewTransaction}
                />
            )}
        </MainLayout>
    )
}
