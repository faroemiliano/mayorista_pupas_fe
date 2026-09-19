import { Link } from 'react-router-dom'
import { apiAsset } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useShoppingTools } from '../../context/ShoppingToolsContext'
import type { Product } from '../../types/catalog'
import { formatCurrency } from '../../utils/currency'

export function CompactProductCard({ product }: { product: Product }) {
  const { user } = useAuth()
  const cart = useCart()
  const tools = useShoppingTools()
  const image = product.imagen_url ? apiAsset(`/api/productos/${product.id}/imagen`) : null
  const productPath = `/producto/${product.id}/${product.slug || 'producto'}`

  return <article className="relative grid min-h-34 grid-cols-[92px_1fr] overflow-hidden border border-neutral-200 bg-white">
    <Link to={productPath} onClick={() => tools.view(product)} className="relative block min-h-34 overflow-hidden bg-neutral-100 no-underline">
      {image ? <img className="absolute inset-0 h-full w-full object-cover" src={image} alt={product.nombre}/> : <span className="grid h-full place-items-center text-3xl">👙</span>}
    </Link>
    <div className="flex min-w-0 flex-col p-3 pr-9">
      {user && <button type="button" className="absolute right-2 top-2 grid size-7 place-items-center text-base text-neutral-700" onClick={() => tools.toggleFavorite(product)} aria-label={tools.isFavorite(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}>{tools.isFavorite(product.id) ? '♥' : '♡'}</button>}
      <small className="truncate text-[8px] font-bold uppercase tracking-[.14em] text-neutral-400">{product.marca?.nombre || product.categoria?.nombre || 'Marca propia'}</small>
      <Link to={productPath} onClick={() => tools.view(product)} className="mt-1 line-clamp-2 font-serif text-base font-semibold leading-tight text-neutral-900 no-underline">{product.nombre}</Link>
      {user && <strong className="mt-2 text-xs">{product.precio_mayorista ? formatCurrency(Number(product.precio_mayorista)) : 'Consultar'}</strong>}
      {user && <button type="button" className="mt-auto w-fit bg-black px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider text-white disabled:bg-neutral-300" disabled={!product.tiene_stock || !product.precio_mayorista} onClick={() => cart.addItem(product, 1)}>{product.tiene_stock ? 'Agregar' : 'Sin stock'}</button>}
    </div>
  </article>
}
