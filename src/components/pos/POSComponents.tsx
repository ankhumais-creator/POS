import { Search, Barcode } from 'lucide-react'
import type { Category } from '@/types'

interface POSSearchBarProps {
    readonly searchQuery: string
    readonly onSearchChange: (query: string) => void
    readonly onScanClick: () => void
}

export function POSSearchBar({ searchQuery, onSearchChange, onScanClick }: POSSearchBarProps) {
    return (
        <div className="flex gap-2 mb-3" data-testid="pos-search-bar">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                <input
                    type="text"
                    className="input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Cari produk atau scan barcode..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    data-testid="pos-search-input"
                />
            </div>
            <button
                className="btn btn-secondary px-3"
                onClick={onScanClick}
                title="Scan Barcode"
                data-testid="pos-scan-button"
            >
                <Barcode className="w-5 h-5" />
            </button>
        </div>
    )
}

interface CategoryTabsProps {
    readonly categories: Category[]
    readonly selectedCategory: string | null
    readonly onSelectCategory: (categoryId: string | null) => void
}

export function CategoryTabs({ categories, selectedCategory, onSelectCategory }: CategoryTabsProps) {
    return (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1" data-testid="category-tabs">
            <button
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${!selectedCategory ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                onClick={() => onSelectCategory(null)}
                data-testid="category-tab-all"
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
                    onClick={() => onSelectCategory(cat.id)}
                    data-testid={`category-tab-${cat.id}`}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    )
}
