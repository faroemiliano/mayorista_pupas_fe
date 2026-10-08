import { useQuery } from '@tanstack/react-query'
import { getProducts } from '../../api/catalog'
import { productImageAsset } from '../../api/client'
import { useNavigate } from 'react-router-dom'
import { useShoppingTools } from '../../context/ShoppingToolsContext'
import type { Product } from '../../types/catalog'

function ProductImage({ product }: { product: Product }) {
  const image = product.imagenes
    ?.slice()
    .sort((a, b) => Number(b.principal) - Number(a.principal) || a.orden - b.orden || a.id - b.id)[0]
  if (image) return <img className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" src={productImageAsset(image.url, `/api/productos/${product.id}/imagenes/${image.id}`, 480)} alt={product.nombre} loading="lazy" decoding="async" />
  if (product.imagen_url) return <img className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" src={productImageAsset(product.imagen_url, `/api/productos/${product.id}/imagen`, 480)} alt={product.nombre} loading="lazy" decoding="async" />
  return <span className="grid h-full place-items-center bg-neutral-100 text-5xl" aria-hidden="true">👙</span>
}

export function FeaturedProducts() {
  const navigate = useNavigate()
  const tools = useShoppingTools()
  const products = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => getProducts({ buscar: '', categoriaId: '', subcategoriaId: '', marcaId: '', orden: 'recientes', page: 1, limit: 4, soloDestacados: true }),
    staleTime: 60_000,
  })

  if (products.isLoading || !products.data?.items.length) return null

  return <section className="border-y border-neutral-200 bg-[#f7f6f3] px-5 py-16 sm:px-8 lg:px-[7vw] lg:py-22">
    <div className="mx-auto max-w-360">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[.25em] text-neutral-500">Selección Pupas</p>
          <h2 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Productos destacados</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-neutral-500">Modelos elegidos para inspirar tu próxima compra.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
        {products.data.items.map(product => <button key={product.id} type="button" className="group overflow-hidden bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg" onClick={() => { tools.view(product); navigate(`/producto/${product.id}/${product.slug || 'producto'}`) }} aria-label={`Ver ${product.nombre}`}>
          <div className="aspect-[3/4] overflow-hidden"><ProductImage product={product} /></div>
          <div className="p-4"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-neutral-500">{product.marca?.nombre || product.categoria?.nombre || 'Pupas'}</p><h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold uppercase leading-snug tracking-wide text-neutral-900">{product.nombre}</h3><span className="mt-3 block text-[9px] font-bold uppercase tracking-[.15em] text-neutral-500">Ver detalle →</span></div>
        </button>)}
      </div>
    </div>
  </section>
}
