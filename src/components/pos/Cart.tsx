import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/lib/utils'

export default function Cart() {
    const { items, updateQuantity, removeItem } = useCartStore()

    if (items.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-500" data-testid="cart-empty">
                <div className="text-center">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Keranjang kosong</p>
                    <p className="text-sm mt-1">Pilih produk untuk memulai</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-auto" data-testid="cart-items">
            {items.map(item => (
                <div key={item.product_id} className="cart-item" data-testid={`cart-item-${item.product_id}`}>
                    <div className="cart-item-info">
                        <p className="cart-item-name">{item.product_name}</p>
                        <p className="cart-item-price">{formatCurrency(item.price)} × {item.quantity}</p>
                    </div>

                    <div className="qty-control">
                        <button
                            className="qty-btn"
                            onClick={() => {
                                if (item.quantity === 1) {
                                    removeItem(item.product_id)
                                } else {
                                    updateQuantity(item.product_id, item.quantity - 1)
                                }
                            }}
                            data-testid={`qty-minus-${item.product_id}`}
                        >
                            {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-400" /> : <Minus className="w-3 h-3" />}
                        </button>
                        <span className="qty-value" data-testid={`qty-value-${item.product_id}`}>{item.quantity}</span>
                        <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            data-testid={`qty-plus-${item.product_id}`}
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>

                    <p className="cart-item-subtotal">{formatCurrency(item.subtotal)}</p>
                </div>
            ))}
        </div>
    )
}

