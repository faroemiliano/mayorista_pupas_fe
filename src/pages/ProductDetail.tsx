import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getProduct } from '../api/catalog'
import { apiAsset } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/currency'
import { QuantityControl } from '../components/cart/QuantityControl'

export function ProductDetail({ productId }: { productId: number }) {
  const { user } = useAuth()
  const cart = useCart()
  const [imageIndex, setImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize,setSelectedSize]=useState<number>()
  const product = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: () => getProduct(productId),
    enabled: Number.isFinite(productId) && productId > 0,
  })

  const images = useMemo(() => {
    if (!product.data) return []
    if (product.data.imagenes?.length) {
      return [...product.data.imagenes]
        .sort((a, b) => Number(b.principal) - Number(a.principal) || a.orden - b.orden || a.id - b.id)
        .map((image) => apiAsset(`/api/productos/${product.data!.id}/imagenes/${image.id}`))
    }
    return product.data.imagen_url ? [apiAsset(`/api/productos/${product.data.id}/imagen`)] : []
  }, [product.data])
  useEffect(()=>{setSelectedSize(product.data?.talles?.find(size=>size.disponible>0)?.talle);setQuantity(1)},[product.data])

  if (product.isLoading) return <section className="grid min-h-[70vh] place-items-center bg-white"><div className="text-center"><span className="mx-auto block size-8 animate-spin rounded-full border-2 border-neutral-200 border-t-black"/><p className="mt-4 text-xs uppercase tracking-wider text-neutral-500">Cargando producto</p></div></section>

  if (product.isError || !product.data) return <section className="grid min-h-[70vh] place-items-center bg-white px-6 text-center"><div><h1 className="font-serif text-3xl">Producto no disponible</h1><p className="mt-3 text-sm text-neutral-500">No pudimos encontrar este producto.</p><Link to="/" className="mt-6 inline-flex bg-black px-5 py-3 text-xs font-bold uppercase tracking-wider text-white no-underline">Volver a la tienda</Link></div></section>

  const item = product.data
  const price = Number(item.precio_mayorista ?? 0)
  const maxStock = item.talles?.find(size=>size.talle===selectedSize)?.disponible??0
  const categorySlug = item.categoria?.nombre.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-') || ''

  return <section className="bg-white px-5 py-10 sm:px-8 lg:px-[7vw] lg:py-16">
    <div className="mx-auto max-w-360">
      <nav className="mb-7 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.15em] text-neutral-400">
        <Link to="/" className="text-neutral-500 no-underline hover:text-black">Inicio</Link><span>/</span>
        {item.categoria && <><Link to={`/coleccion/${categorySlug}`} className="text-neutral-500 no-underline hover:text-black">{item.categoria.nombre}</Link><span>/</span></>}
        <span className="truncate">{item.nombre}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,58%)_minmax(320px,42%)] lg:gap-16">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
            {images.length ? <img className="h-full w-full object-cover" src={images[imageIndex]} alt={item.nombre}/> : <div className="grid h-full place-items-center text-7xl">👙</div>}
          </div>
          {images.length > 1 && <div className="mt-3 grid grid-cols-5 gap-2">{images.map((image, index) => <button type="button" key={image} onClick={() => setImageIndex(index)} className={`aspect-[3/4] overflow-hidden border ${index === imageIndex ? 'border-black' : 'border-transparent'}`}><img className="h-full w-full object-cover" src={image} alt={`${item.nombre}, foto ${index + 1}`}/></button>)}</div>}
        </div>

        <div className="lg:sticky lg:top-40 lg:self-start">
          <p className="text-[9px] font-bold uppercase tracking-[.2em] text-neutral-500">{item.marca?.nombre || item.categoria?.nombre || 'Marca propia'}</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight lg:text-5xl">{item.nombre}</h1>
          {item.dux_codigo && <p className="mt-3 text-[9px] uppercase tracking-[.14em] text-neutral-400">SKU {item.dux_codigo}</p>}
          <p className="mt-7 border-t border-neutral-200 pt-6 text-sm leading-7 text-neutral-600">{item.descripcion || 'Producto de nuestra colección mayorista.'}</p>

          {user ? <div className="mt-7 border-y border-neutral-200 py-6">
            <strong className="text-2xl">{price ? formatCurrency(price) : 'Consultar precio'}</strong>
            <span className="mt-1 block text-[9px] uppercase tracking-[.15em] text-neutral-500">Precio mayorista</span>
            <div className="mt-5"><span className="text-[10px] font-bold uppercase tracking-wider">Talle</span><div className="mt-2 flex gap-2">{[1,2,3,4,5].map(size=>{const stock=item.talles?.find(x=>x.talle===size)?.disponible??0;return <button type="button" key={size} disabled={!stock} onClick={()=>{setSelectedSize(size);setQuantity(1)}} className={`size-10 border text-sm font-bold ${selectedSize===size?'bg-black text-white':'border-neutral-300'} disabled:bg-neutral-100 disabled:text-neutral-300`}>{size}</button>})}</div></div>
            <p className={`mt-5 text-xs font-bold uppercase tracking-wider ${maxStock ? 'text-emerald-700' : 'text-neutral-500'}`}>{maxStock ? `${maxStock} unidades disponibles en talle ${selectedSize}` : 'Sin stock por talle'}</p>
            {maxStock > 0 && price > 0 && <div className="mt-6 flex min-h-13 border border-black">
              <QuantityControl value={quantity} max={maxStock} onChange={setQuantity}/>
              <button type="button" className="grow bg-black px-5 text-[10px] font-bold uppercase tracking-[.15em] text-white" onClick={() => cart.addItem(item, quantity, selectedSize)}>Agregar al carrito</button>
            </div>}
          </div> : <div className="mt-7 border-y border-neutral-200 py-6"><p className="text-sm leading-6 text-neutral-600">Iniciá sesión para consultar precios, stock y realizar pedidos mayoristas.</p></div>}

          <div className="mt-7 space-y-3 text-xs text-neutral-500">
            <p>Envíos a todo el país.</p>
            <p>Compra mínima y descuentos indicados en la tienda.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
}
