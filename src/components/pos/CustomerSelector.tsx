import { UserCircle, X } from 'lucide-react'
import type { Customer } from '@/types'

interface CustomerSelectorProps {
    readonly selectedCustomer: Customer | null
    readonly onSelectCustomer: (customer: Customer | null) => void
    readonly searchQuery: string
    readonly onSearchChange: (query: string) => void
    readonly searchResults: Customer[]
    readonly showResults: boolean
    readonly onShowResults: (show: boolean) => void
}

export function CustomerSelector({
    selectedCustomer,
    onSelectCustomer,
    searchQuery,
    onSearchChange,
    searchResults,
    showResults,
    onShowResults
}: CustomerSelectorProps) {
    if (selectedCustomer) {
        return (
            <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg" data-testid="selected-customer">
                <div className="flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-blue-400" />
                    <div>
                        <p className="text-sm font-medium" data-testid="customer-name">{selectedCustomer.name}</p>
                        <p className="text-xs text-slate-400">{selectedCustomer.points} poin</p>
                    </div>
                </div>
                <button
                    onClick={() => onSelectCustomer(null)}
                    className="p-1 hover:bg-slate-700 rounded"
                    data-testid="remove-customer-button"
                >
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            </div>
        )
    }

    return (
        <div className="relative" data-testid="customer-selector">
            <input
                type="text"
                className="input text-sm py-2"
                placeholder="Pilih pelanggan (opsional)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => onShowResults(true)}
                data-testid="customer-search-input"
            />
            {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
                    {searchResults.map(c => (
                        <button
                            key={c.id}
                            className="w-full p-2 text-left hover:bg-slate-700 text-sm"
                            onClick={() => {
                                onSelectCustomer(c)
                                onSearchChange('')
                                onShowResults(false)
                            }}
                            data-testid={`customer-result-${c.id}`}
                        >
                            <p className="font-medium">{c.name}</p>
                            <p className="text-xs text-slate-400">{c.phone}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
