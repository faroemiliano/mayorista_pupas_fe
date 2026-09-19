import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '../../api/catalog'
import { apiAsset } from '../../api/client'
import { useCatalogFilters } from '../../hooks/useCatalog'
import type { Product } from '../../types/catalog'
import { useNavigate } from 'react-router-dom'
import { useShoppingTools } from '../../context/ShoppingToolsContext'

const collections = [
  {
    title: 'Bikinis',
    keyword: 'bikini',
    video: 'bikinis.mp4',
    background: 'bg-[#f3f3f1]',
    muted: 'text-neutral-500',
    copy: 'Diseños para una temporada que se vende antes de empezar.',
    provisional: ['/images/home/provisional/bikini-01.webp', '/images/home/provisional/bikini-02.webp'],
    reverse: false,
  },
  {
    title: 'Pijamas',
    keyword: 'pijama',
    video: 'pijamas.mp4',
    background: 'bg-[#171717] text-white',
    muted: 'text-white/45',
    copy: 'Comodidad, textura y modelos pensados para todo el año.',
    provisional: ['/images/home/provisional/pijama-01.webp', '/images/home/provisional/pijama-02.webp'],
    reverse: true,
  },
] as const

function VideoSlot({ file, title, dark }: { file: string; title: string; dark: boolean }) {
  const [failed, setFailed] = useState(false)
  return <div className="relative mx-auto w-full max-w-135">
    <div className={`absolute -left-4 -top-4 size-20 border-l border-t ${dark ? 'border-white/30' : 'border-black/25'}`}/>
    <div className="relative aspect-[9/16] overflow-hidden bg-black">
      <div className="absolute inset-0 grid place-items-center px-7 text-center text-neutral-500">
        <div><span className="mx-auto grid size-12 place-items-center rounded-full border border-current text-lg">▶</span><strong className="mt-4 block font-serif text-xl font-medium">Video de {title}</strong><small className="mt-2 block text-[9px] uppercase tracking-[.2em]">Campaña de la colección</small></div>
      </div>
      {!failed && <video className="relative h-full w-full object-contain" src={`/videos/home/collections/${file}`} autoPlay muted loop playsInline preload="metadata" aria-label={`Video de la colección ${title}`} onError={() => setFailed(true)}/>}
      <span className="absolute bottom-4 left-4 bg-white px-3 py-2 text-[8px] font-bold uppercase tracking-[.18em] text-black">En movimiento</span>
    </div>
  </div>
}

function productImage(product: Product, fallback?: string) {
  const mainImage = product.imagenes
    ?.slice()
    .sort((a, b) => Number(b.principal) - Number(a.principal) || a.orden - b.orden || a.id - b.id)[0]

  if (mainImage) return apiAsset(`/api/productos/${product.id}/imagenes/${mainImage.id}`)
  if (product.imagen_url) return apiAsset(`/api/productos/${product.id}/imagen`)
  return fallback
}

function CollectionProductPhoto({ product, fallback }: { product: Product; fallback?: string }) {
  const navigate = useNavigate()
  const tools = useShoppingTools()
  const image = productImage(product, fallback)

  const openProduct = () => {
    tools.view(product)
    navigate(`/producto/${product.id}/${product.slug || 'producto'}`)
  }

  return <button className="group block aspect-[3/4] w-full overflow-hidden bg-white/40 text-left" type="button" aria-label={`Ver ${product.nombre}`} onClick={openProduct}>
    {image
      ? <img className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" src={image} alt={product.nombre} loading="lazy"/>
      : <span className="grid h-full place-items-center text-5xl" aria-hidden="true">👙</span>}
  </button>
}

function CollectionProducts({ keyword, provisional }: { keyword: string; provisional: readonly string[] }) {
  const filters = useCatalogFilters()
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')
  const category = filters.data?.categorias.find((item) => normalize(item.nombre).includes(keyword))
  const products = useQuery({
    queryKey: ['home-collection-products', category?.id],
    queryFn: () => getProducts({ buscar: '', categoriaId: String(category?.id), subcategoriaId: '', marcaId: '', orden: 'nombre_asc', page: 1 }),
    enabled: Boolean(category),
    staleTime: 60_000,
  })

  return <div className="grid grid-cols-2 items-start gap-3 pb-8 sm:grid-cols-12 sm:gap-5 sm:pb-16">
    {products.isLoading && [0, 1].map((item) => <div key={item} className={`aspect-[3/4] animate-pulse bg-white/40 ${item === 0 ? 'sm:col-span-7 sm:mt-12' : 'sm:col-span-5'}`}/>)}
    {products.data?.items.slice(0, 2).map((product, index) => <div key={product.id} className={`relative transition duration-500 hover:z-10 hover:-translate-y-2 hover:drop-shadow-2xl ${index === 0 ? 'sm:col-span-7 sm:mt-12' : 'sm:col-span-5 sm:-translate-y-2'}`}><CollectionProductPhoto product={product} fallback={provisional[index]}/></div>)}
    {!products.isLoading && !products.data?.items.length && [0, 1].map((item) => <div key={item} className={`relative aspect-[3/4] overflow-hidden bg-white/40 ${item === 0 ? 'sm:col-span-7 sm:mt-12' : 'sm:col-span-5'}`}>{provisional[item] ? <img className="h-full w-full object-cover" src={provisional[item]} alt={`Modelo provisorio de ${keyword}`}/> : <span className="grid h-full place-items-center px-4 text-center text-xs text-neutral-500">Próximo producto</span>}</div>)}
  </div>
}

export function EditorialCollections({ onCategoryNavigate }: { onCategoryNavigate: (category: string) => void }) {
  return <section id="colecciones" className="overflow-hidden bg-white">
    {collections.map((collection, index) => {
      const dark = collection.background.includes('text-white')
      return <article key={collection.title} className={`relative overflow-hidden px-5 py-18 sm:px-8 lg:px-[7vw] lg:py-26 ${collection.background}`}>
        <span className={`pointer-events-none absolute -right-3 -top-10 select-none font-serif text-[clamp(7rem,19vw,18rem)] italic leading-none opacity-[.07] ${dark ? 'text-white' : 'text-black'}`}>{collection.title}</span>
        <div className="relative mx-auto max-w-360">
          <div className="mb-12 grid items-end gap-6 border-b border-current/20 pb-7 md:grid-cols-[1fr_auto]">
            <div className="flex items-start gap-5">
              <span className={`pt-2 font-serif text-2xl italic ${collection.muted}`}>{String(index + 1).padStart(2, '0')}</span>
              <div><p className={`text-[9px] font-bold uppercase tracking-[.25em] ${collection.muted}`}>Capítulo de temporada</p><h2 className="mt-2 font-serif text-5xl font-semibold uppercase leading-none sm:text-7xl">{collection.title}</h2></div>
            </div>
            <p className={`max-w-sm text-sm leading-6 md:text-right ${collection.muted}`}>{collection.copy}</p>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[minmax(300px,40%)_minmax(0,60%)] lg:gap-16">
            <div className={collection.reverse ? 'lg:order-2' : ''}><VideoSlot file={collection.video} title={collection.title} dark={dark}/></div>
            <div className={collection.reverse ? 'lg:order-1' : ''}>
              <div className="mb-5 flex items-center justify-between"><span className={`text-[9px] font-bold uppercase tracking-[.2em] ${collection.muted}`}>Productos destacados</span><button type="button" onClick={() => onCategoryNavigate(collection.keyword)} className={`border-b pb-1 text-[9px] font-bold uppercase tracking-[.16em] ${dark ? 'border-white text-white' : 'border-black text-black'}`}>Ver colección completa →</button></div>
              <CollectionProducts keyword={collection.keyword} provisional={collection.provisional}/>
            </div>
          </div>
        </div>
      </article>
    })}
  </section>
}
