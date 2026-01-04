import { ShoppingCart, Grid3x3 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface MobileTabBarProps {
    readonly activeTab: 'products' | 'cart'
    readonly onTabChange: (tab: 'products' | 'cart') => void
    readonly itemCount: number
    readonly total: number
}

export default function MobileTabBar({ activeTab, onTabChange, itemCount, total }: MobileTabBarProps) {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 safe-area-bottom z-40">
            <div className="grid grid-cols-2 gap-0">
                {/* Products Tab */}
                <button
                    onClick={() => onTabChange('products')}
                    className={`flex flex-col items-center justify-center py-3 px-4 transition-all ${activeTab === 'products'
                            ? 'bg-blue-500/10 text-blue-400 border-t-2 border-blue-500'
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                    data-testid="mobile-tab-products"
                >
                    <Grid3x3 className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Produk</span>
                </button>

                {/* Cart Tab */}
                <button
                    onClick={() => onTabChange('cart')}
                    className={`flex flex-col items-center justify-center py-3 px-4 transition-all relative ${activeTab === 'cart'
                            ? 'bg-blue-500/10 text-blue-400 border-t-2 border-blue-500'
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                    data-testid="mobile-tab-cart"
                >
                    <div className="relative">
                        <ShoppingCart className="w-6 h-6 mb-1" />
                        {itemCount > 0 && (
                            <div className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {itemCount > 99 ? '99+' : itemCount}
                            </div>
                        )}
                    </div>
                    <span className="text-xs font-medium">
                        Keranjang
                    </span>
                    {total > 0 && (
                        <span className="text-[10px] text-slate-500 mt-0.5">
                            {formatCurrency(total)}
                        </span>
                    )}
                </button>
            </div>
        </div>
    )
}
