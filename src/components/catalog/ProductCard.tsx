import { useEffect, useMemo, useState } from 'react'
import { apiAsset } from '../../api/client'
import { useCart } from '../../context/CartContext'
import type { Product } from '../../types/catalog'
import { formatCurrency } from '../../utils/currency'
import { QuantityControl } from '../cart/QuantityControl'
import { useAuth } from '../../context/AuthContext'
import { useShoppingTools } from '../../context/ShoppingToolsContext'
import { useNavigate } from 'react-router-dom'

export function ProductCard({ product, fallbackImage }: { product: Product; fallbackImage?: string }) {
  const cart = useCart()
  const { user } = useAuth()
  const tools = useShoppingTools()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const availableSizes = product.talles?.filter(item=>item.disponible>0) ?? []
  const [selectedSize,setSelectedSize]=useState<number|undefined>(availableSizes[0]?.talle)
  const [imageIndex, setImageIndex] = useState(0)
  const price = Number(product.precio_mayorista ?? 0)
  const maxStock = product.talles?.find(item=>item.talle===selectedSize)?.disponible ?? 0
  const creationTime = product.fecha_creacion_dux ? new Date(`${product.fecha_creacion_dux}T00:00:00`).getTime() : 0
  const isNew = creationTime > 0 && Date.now() - creationTime <= 60 * 24 * 60 * 60 * 1000

  const images = useMemo(() => {
    if (product.imagenes?.length) {
      return [...product.imagenes]
        .sort((a, b) => Number(b.principal) - Number(a.principal) || a.orden - b.orden || a.id - b.id)
        .map((image) => apiAsset(`/api/productos/${product.id}/imagenes/${image.id}`))
    }
    if (product.imagen_url) return [apiAsset(`/api/productos/${product.id}/imagen`)]
    return fallbackImage ? [fallbackImage] : []
  }, [fallbackImage, product.id, product.imagen_url, product.imagenes])

  useEffect(() => setImageIndex(0), [product.id])

  const changeImage = (direction: number) => {
    setImageIndex((current) => (current + direction + images.length) % images.length)
  }

  const addToCart = () => {
    if (!selectedSize) return
    cart.addItem(product, quantity, selectedSize)
    setQuantity(1)
  }

  const openProduct = () => {
    tools.view(product)
    navigate(`/producto/${product.id}/${product.slug || 'producto'}`)
  }

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden border border-neutral-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(0,0,0,0.1)]">
      <div className="relative aspect-[3/4] shrink-0 overflow-hidden bg-neutral-100">
        <button className="absolute inset-0 z-[5] cursor-pointer" type="button" aria-label={`Ver información de ${product.nombre}`} onClick={openProduct}/>
        {isNew && <span className="absolute left-3 top-3 z-20 bg-black px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[.18em] text-white shadow-md">Nuevo</span>}
        {user && <button className="absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-full bg-white/95 text-xl text-neutral-900 shadow-md transition hover:scale-105" type="button" aria-label={tools.isFavorite(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'} onClick={() => tools.toggleFavorite(product)}>{tools.isFavorite(product.id) ? '♥' : '♡'}</button>}

        {images.length ? (
          <img key={images[imageIndex]} className="block h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.025]" src={images[imageIndex]} alt={`${product.nombre} - foto ${imageIndex + 1}`} loading="lazy" />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-b from-neutral-50 to-neutral-200 text-6xl" aria-hidden="true">👙</div>
        )}

        {user && <span className={`absolute left-3 z-10 rounded-sm px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide shadow-sm ${isNew ? 'top-12' : 'top-3'} ${product.tiene_stock ? 'bg-white/95 text-emerald-800' : 'bg-neutral-800 text-white'}`}>
          {product.tiene_stock ? `${maxStock} disponibles` : 'Sin stock'}
        </span>}

        {images.length > 1 && <>
          <button type="button" aria-label="Foto anterior" className="absolute left-2 top-1/2 z-20 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-2xl text-neutral-900 shadow-md transition hover:bg-white" onClick={() => changeImage(-1)}>‹</button>
          <button type="button" aria-label="Foto siguiente" className="absolute right-2 top-1/2 z-20 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-2xl text-neutral-900 shadow-md transition hover:bg-white" onClick={() => changeImage(1)}>›</button>
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1.5" aria-label={`Foto ${imageIndex + 1} de ${images.length}`}>
            {images.map((_, index) => <button key={index} type="button" aria-label={`Ver foto ${index + 1}`} onClick={() => setImageIndex(index)} className={`size-1.5 rounded-full transition ${index === imageIndex ? 'w-4 bg-white' : 'bg-white/55 hover:bg-white'}`} />)}
          </div>
        </>}

        <button className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-neutral-800 opacity-0 shadow transition group-hover:opacity-100 focus:opacity-100" type="button" onClick={openProduct}>Ver producto</button>
      </div>

      {user && price > 0 && <div className="border-t border-neutral-200 bg-white px-3 py-3"><span className="mb-2 block text-[9px] font-bold uppercase tracking-wider">Elegí el talle</span><div className="flex gap-1.5">{[1,2,3,4,5].map(size=>{const stock=product.talles?.find(item=>item.talle===size)?.disponible??0;return <button key={size} type="button" disabled={!stock} onClick={()=>{setSelectedSize(size);setQuantity(1)}} className={`grid size-8 place-items-center border text-xs font-bold ${selectedSize===size?'border-black bg-black text-white':'border-neutral-300'} disabled:bg-neutral-100 disabled:text-neutral-300`}>{size}</button>})}</div>{!availableSizes.length&&<small className="mt-2 block text-amber-700">Stock por talles pendiente de configuración.</small>}</div>}
      {user && maxStock > 0 && price > 0 && <div className="flex min-h-12 border-y border-black bg-black text-white">
        <div className="border-r border-white/25 bg-white px-1 py-1 text-black"><QuantityControl value={quantity} max={maxStock} onChange={setQuantity} /></div>
        <button className="grow px-3 text-[11px] font-extrabold uppercase tracking-[.14em] transition hover:bg-neutral-700" type="button" onClick={addToCart}>Agregar al carrito</button>
      </div>}

      <div className="relative z-10 flex grow flex-col bg-white px-4 pb-5 pt-4">
        <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.18em] text-neutral-500">{product.marca?.nombre || product.categoria?.nombre || 'Marca propia'}</p>
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold uppercase leading-snug tracking-wide">{product.nombre}</h3>
        {user && <div className="mt-2">
          <strong className="text-base text-neutral-900">{price ? formatCurrency(price) : 'Consultar'}</strong>
          <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-gray-500">Precio mayorista</span>
        </div>}
      </div>

    </article>
  )
}
