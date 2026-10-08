import { useQueries } from '@tanstack/react-query'
import { getProducts } from '../../api/catalog'
import { productImageAsset } from '../../api/client'
import type { CatalogCategory, Product } from '../../types/catalog'

type Props = {
  categories?: CatalogCategory[]
  selectedCategory: string
  onSelect: (categoryId: string) => void
}

const styles = [
  { label: 'Bikinis', keywords: ['bikini', 'malla', 'traje de baño'], fallback: '👙', fallbackImage: '/images/home/provisional/bikini-01.webp' },
  { label: 'Pijamas', keywords: ['pijama', 'pijamas', 'sleep'], fallback: '🌙', fallbackImage: '/images/home/provisional/pijama-01.webp' },
  { label: 'Lencería', keywords: ['lencería', 'lenceria', 'ropa interior', 'corpiño'], fallback: '♡', fallbackImage: '/images/home/lenceria-carousel.webp' },
]

function productImage(product: Product | undefined) {
  if (!product) return null
  const mainImage = product.imagenes
    ?.slice()
    .sort((a, b) => Number(b.principal) - Number(a.principal) || a.orden - b.orden || a.id - b.id)[0]
  if (mainImage) return productImageAsset(mainImage.url, `/api/productos/${product.id}/imagenes/${mainImage.id}`, 480)
  return product.imagen_url ? productImageAsset(product.imagen_url, `/api/productos/${product.id}/imagen`, 480) : null
}

export function MobileStylePicker({ categories = [], selectedCategory, onSelect }: Props) {
  const featured = styles.map((style) => ({
    ...style,
    category: categories.find((category) =>
      style.keywords.some((keyword) => category.nombre.toLocaleLowerCase('es').includes(keyword)),
    ),
  }))

  const products = useQueries({
    queries: featured.map((style) => ({
      queryKey: ['mobile-style-highlight', style.category?.id],
      queryFn: () => getProducts({
        buscar: '',
        categoriaId: String(style.category?.id),
        subcategoriaId: '',
        marcaId: '',
        orden: 'nombre_asc',
        page: 1,
        limit: 100,
      }),
      enabled: Boolean(style.category),
      staleTime: 60_000,
    })),
  })

  const select = (categoryId: string) => {
    onSelect(categoryId)
    window.requestAnimationFrame(() => {
      document.getElementById('productos-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <section className="mt-6 md:hidden" aria-label="Comprar por estilo">
      <div className="mb-3 flex items-end justify-between">
        <div><p className="text-[9px] font-semibold tracking-[0.2em] text-neutral-500">COMPRÁ POR ESTILO</p><h3 className="mt-1 font-serif text-2xl font-semibold">¿Qué estás buscando?</h3></div>
        <span className="text-xs text-neutral-500">Tocá para explorar</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {featured.map((style, index) => {
          const productQuery = products[index]
          const product = productQuery.data?.items.find(item => Boolean(item.imagenes?.length || item.imagen_url))
          const imageUrl = productImage(product) || style.fallbackImage
          const isSelected = style.category && String(style.category.id) === selectedCategory
          return (
            <button
              key={style.label}
              type="button"
              disabled={!style.category}
              onClick={() => style.category && select(String(style.category.id))}
              className={`group overflow-hidden border bg-white text-left transition active:scale-95 disabled:opacity-55 ${isSelected ? 'border-black ring-1 ring-black' : 'border-neutral-200'}`}
            >
              <div className="flex aspect-[3/4] items-center justify-center overflow-hidden bg-neutral-100">
                {productQuery.isLoading
                  ? <span className="h-full w-full animate-pulse bg-neutral-200" aria-label={`Cargando imagen de ${style.label}`}/>
                  : imageUrl
                    ? <img className="h-full w-full object-cover" src={imageUrl} alt={product?.nombre || style.label}/>
                    : <span className="text-4xl grayscale" aria-hidden="true">{style.fallback}</span>}
              </div>
              <div className="px-2 py-3 text-center"><strong className="block truncate font-serif text-sm">{style.category?.nombre || style.label}</strong><span className="mt-1 block text-[8px] font-bold tracking-wider text-neutral-500">VER TODO →</span></div>
            </button>
          )
        })}
      </div>
      <button
        type="button"
        className={`mt-3 w-full border px-4 py-3 text-xs font-bold uppercase tracking-[.12em] transition ${!selectedCategory ? 'border-black bg-black text-white' : 'border-neutral-300 bg-white text-neutral-800'}`}
        onClick={() => select('')}
      >
        Ver toda la colección
      </button>
      {categories.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`shrink-0 border px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${String(category.id) === selectedCategory ? 'border-black bg-black text-white' : 'border-neutral-200 bg-white text-neutral-700'}`}
              onClick={() => select(String(category.id))}
            >
              {category.nombre}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
