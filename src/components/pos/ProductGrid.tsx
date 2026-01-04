import { Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductGridProps {
    readonly products: Product[]
    readonly onAddProduct: (product: Product) => void
}

export default function ProductGrid({ products, onAddProduct }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-500" data-testid="product-grid-empty">
                <div className="text-center">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Tidak ada produk ditemukan</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-auto p-4" data-testid="product-grid">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {products.map(product => (
                    <button
                        type="button"
                        key={product.id}
                        className={`product-card ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={product.stock <= 0}
                        onClick={() => onAddProduct(product)}
                        data-testid={`product-card-${product.id}`}
                    >
                        <div className="product-image">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <Package className="w-6 h-6 text-slate-500" />
                            )}
                        </div>
                        <p className="product-name">{product.name}</p>
                        <p className="product-price">{formatCurrency(product.price)}</p>
                        {product.stock <= product.min_stock && product.stock > 0 && (
                            <span className="badge badge-warning text-xs mt-1">Stok: {product.stock}</span>
                        )}
                        {product.stock <= 0 && (
                            <span className="badge badge-danger text-xs mt-1">Habis</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}


