import { apiGet } from './client'
import type { CatalogFilters, ProductPage, ProductQuery } from '../types/catalog'

export function getCatalogFilters() {
  return apiGet<CatalogFilters>('/api/catalogo/filtros')
}

export function getProducts(query: ProductQuery) {
  const params = new URLSearchParams({
    solo_habilitados: 'true',
    page: String(query.page),
    limit: '12',
    orden: query.orden,
  })
  if (query.buscar) params.set('buscar', query.buscar)
  if (query.categoriaId) params.set('categoria_id', query.categoriaId)
  if (query.subcategoriaId) params.set('subcategoria_id', query.subcategoriaId)
  if (query.marcaId) params.set('marca_id', query.marcaId)
  return apiGet<ProductPage>(`/api/productos/?${params}`)
}
