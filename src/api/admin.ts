import { apiGet, apiPost } from './client'
import type { ProductPage } from '../types/catalog'
import type { AdminDashboardData, AdminFiltersData, AdminProductsData, ProductAnalytics } from '../types/admin'
import type { DuxClientPage, DuxClientSyncStatus, DuxClientTotal } from '../types/adminClient'

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const [all, withStock, withoutStock, filters, recent] = await Promise.all([
    apiGet<ProductPage>('/api/productos/?solo_habilitados=true&page=1&limit=1'),
    apiGet<ProductPage>('/api/productos/?solo_habilitados=true&con_stock=true&page=1&limit=1'),
    apiGet<ProductPage>('/api/productos/?solo_habilitados=true&con_stock=false&page=1&limit=1'),
    apiGet<AdminFiltersData>('/api/catalogo/filtros'),
    apiGet<ProductPage>('/api/productos/?solo_habilitados=true&page=1&limit=6&orden=recientes'),
  ])

  return {
    totalProducts: all.total,
    productsWithStock: withStock.total,
    productsWithoutStock: withoutStock.total,
    categories: filters.categorias.length,
    brands: filters.marcas.length,
    recentProducts: recent.items,
  }
}

export function getAdminProducts(page: number) {
  return apiGet<AdminProductsData>(
    `/api/productos/?solo_habilitados=false&page=${page}&limit=20&orden=recientes`,
  )
}

export function getProductAnalytics(days: number | null) {
  return apiGet<ProductAnalytics>(`/api/admin/productos/analitica?dias=${days ?? 0}`)
}

export function getDuxClients(page: number, search = '') {
  const params = new URLSearchParams({ pagina: String(page), limite: '20' })
  if (search.trim()) params.set('buscar', search.trim())
  return apiGet<DuxClientPage>(`/api/admin/clientes-dux/?${params}`)
}


export function getDuxClientTotal() {
  return Promise.race([
    apiGet<DuxClientTotal>('/api/admin/clientes-dux/total'),
    new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('El conteo de Dux tardó demasiado.')), 15000)),
  ])
}

export function syncDuxClients() {
  return apiPost<DuxClientSyncStatus>('/api/admin/clientes-dux/sincronizar', {})
}

export function getDuxClientSyncStatus() {
  return apiGet<DuxClientSyncStatus>('/api/admin/clientes-dux/sincronizacion')
}

export type DuxConfiguration = { escritura_habilitada: boolean; modo: 'desarrollo' | 'produccion' }

export function getDuxConfiguration() {
  return apiGet<DuxConfiguration>('/api/admin/configuracion/dux')
}
