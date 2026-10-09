import { useQuery } from '@tanstack/react-query'
import { getCatalogFilters, getProducts } from '../api/catalog'
import type { ProductQuery } from '../types/catalog'

export function useCatalogFilters() {
  return useQuery({
    queryKey: ['catalog-filters'],
    queryFn: getCatalogFilters,
    // Categorías y subcategorías cambian sólo al administrarlas. Mantenerlas
    // diez minutos evita una consulta adicional en cada navegación pública.
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  })
}

export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: ['products', query],
    queryFn: () => getProducts(query),
    placeholderData: (previous) => previous,
  })
}
