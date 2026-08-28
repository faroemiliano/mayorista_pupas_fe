import { useQuery } from '@tanstack/react-query'
import { getCatalogFilters, getProducts } from '../api/catalog'
import type { ProductQuery } from '../types/catalog'

export function useCatalogFilters() {
  return useQuery({ queryKey: ['catalog-filters'], queryFn: getCatalogFilters })
}

export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: ['products', query],
    queryFn: () => getProducts(query),
    placeholderData: (previous) => previous,
  })
}
