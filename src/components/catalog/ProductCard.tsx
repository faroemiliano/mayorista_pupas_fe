import { useState } from 'react'
import { apiAsset } from '../../api/client'
import { useCart } from '../../context/CartContext'
import type { Product } from '../../types/catalog'
import { formatCurrency } from '../../utils/currency'
import { QuantityControl } from '../cart/QuantityControl'
import { useAuth } from '../../context/AuthContext'

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart()
  const { user } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const price = Number(product.precio_mayorista ?? 0)
  const maxStock = Math.floor(Number(product.stock_disponible))
  const imageUrl = product.imagen_url
    ? apiAsset(`/api/productos/${product.id}/imagen`)
    : null

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-rose-100 bg-white shadow-sm">
      <div className="relative flex h-64 shrink-0 items-center justify-center overflow-hidden bg-rose-50 p-4 sm:h-72">
        {imageUrl ? (
          <img
            className="block h-full w-full object-contain object-center"
            src={imageUrl}
            alt={product.nombre}
            loading="lazy"
          />
        ) : (
          <span className="text-6xl" aria-hidden="true">👙</span>
        )}
        <span className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold ${product.tiene_stock ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
          {product.tiene_stock ? `${Number(product.stock_disponible)} disponibles` : 'Sin stock'}
        </span>
      </div>

      <div className="relative z-10 flex grow flex-col bg-white p-5">
        <p className="mb-2 text-[11px] font-extrabold tracking-[2px] text-[#92556b]">
          {product.marca?.nombre || product.categoria?.nombre || 'Pupas'}
        </p>
        <h3 className="mb-2 line-clamp-2 min-h-11 font-bold leading-snug">{product.nombre}</h3>
        {product.descripcion && <p className="truncate text-xs text-gray-500">{product.descripcion}</p>}

        <div className="mt-auto border-t border-rose-100 pt-4">
          <span className="block text-[10px] text-gray-500">{user ? 'Precio mayorista' : 'Venta mayorista'}</span>
          <strong className="block text-xl">{user ? (price ? formatCurrency(price) : 'Consultar') : 'Iniciá sesión para ver precios'}</strong>
        </div>

        {user && product.tiene_stock && price > 0 && (
          <div className="mt-4 flex gap-2">
            <QuantityControl value={quantity} max={maxStock} onChange={setQuantity}/>
            <button
              className="grow rounded-md bg-[#722f55] px-4 font-bold text-white transition hover:bg-[#5d2445]"
              type="button"
              onClick={() => { cart.addItem(product, quantity); setQuantity(1) }}
            >
              Agregar
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
