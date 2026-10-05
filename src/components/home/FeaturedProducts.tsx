import { useQuery } from '@tanstack/react-query'
import { getProducts } from '../../api/catalog'
import { ProductCard } from '../catalog/ProductCard'

export function FeaturedProducts() {
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
        {products.data.items.map(product => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  </section>
}
