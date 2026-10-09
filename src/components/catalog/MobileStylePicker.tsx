import { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { getProducts } from '../../api/catalog'
import { productImageAsset } from '../../api/client'
import type { CatalogCategory, Product } from '../../types/catalog'

type Props = {
  categories?: CatalogCategory[]
  selectedCategory: string
  selectedSubcategory: string
  onSelect: (categoryId: string) => void
  onSubcategory: (subcategoryId: string) => void
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
  if (mainImage) return productImageAsset(mainImage.url, `/api/productos/${product.id}/imagenes/${mainImage.id}`, 400)
  return product.imagen_url ? productImageAsset(product.imagen_url, `/api/productos/${product.id}/imagen`, 400) : null
}

export function MobileStylePicker({ categories = [], selectedCategory, selectedSubcategory, onSelect, onSubcategory }: Props) {
  const [showCategoryChoices, setShowCategoryChoices] = useState(false)
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
        // Sólo necesitamos una foto representativa para cada tarjeta móvil.
        // Pedir 100 productos por colección multiplicaba tráfico sin mostrarlos.
        orden: 'recientes',
        page: 1,
        limit: 1,
      }),
      enabled: Boolean(style.category) && !selectedCategory,
      staleTime: 60_000,
    })),
  })

  const select = (categoryId: string) => {
    onSelect(categoryId)
    window.requestAnimationFrame(() => {
      document.getElementById('productos-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const activeCategory = categories.find((category) => String(category.id) === selectedCategory)

  if (activeCategory) {
    return (
      <section className="mt-6 border border-neutral-200 bg-neutral-50 p-5 md:hidden" aria-label="Colección seleccionada">
        <p className="text-[9px] font-semibold tracking-[0.2em] text-neutral-500">COLECCIÓN SELECCIONADA</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div><h3 className="font-serif text-3xl font-semibold">{activeCategory.nombre}</h3><p className="mt-1 text-sm text-neutral-500">Estás viendo los productos de esta colección.</p></div>
          <button type="button" className="shrink-0 border border-neutral-300 bg-white px-3 py-2 text-[9px] font-bold uppercase tracking-[.12em] text-neutral-800" onClick={() => setShowCategoryChoices((visible) => !visible)}>{showCategoryChoices ? 'Ocultar' : 'Cambiar'}</button>
        </div>
        {showCategoryChoices && <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{categories.map((category) => <button key={category.id} type="button" className={`shrink-0 border px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${String(category.id) === selectedCategory ? 'border-black bg-black text-white' : 'border-neutral-200 bg-white text-neutral-700'}`} onClick={() => select(String(category.id))}>{category.nombre}</button>)}<button type="button" className="shrink-0 border border-neutral-300 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-700" onClick={() => select('')}>Ver todo</button></div>}
        {activeCategory.subcategorias.length > 0 && <div className="mt-4 border-t border-neutral-200 pt-4"><p className="mb-2 text-[9px] font-bold uppercase tracking-[.16em] text-neutral-500">Filtrar dentro de {activeCategory.nombre}</p><div className="flex gap-2 overflow-x-auto pb-1"><button type="button" className={`shrink-0 border px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${!selectedSubcategory ? 'border-black bg-black text-white' : 'border-neutral-200 bg-white text-neutral-700'}`} onClick={() => onSubcategory('')}>Todos</button>{activeCategory.subcategorias.map((subcategory) => <button key={subcategory.id} type="button" className={`shrink-0 border px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${String(subcategory.id) === selectedSubcategory ? 'border-black bg-black text-white' : 'border-neutral-200 bg-white text-neutral-700'}`} onClick={() => onSubcategory(String(subcategory.id))}>{subcategory.nombre}</button>)}</div></div>}
        <p className="mt-4 border-t border-neutral-200 pt-3 text-xs leading-5 text-neutral-500">¿Buscás un modelo puntual? Usá la lupa del encabezado para buscar en todo el catálogo.</p>
      </section>
    )
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
