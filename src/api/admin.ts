import { apiGet, apiPatch, apiPost } from './client'
import type { ProductPage } from '../types/catalog'
import type { AdminDashboardData, AdminFiltersData, AdminProductsData, ProductAnalytics } from '../types/admin'
import type { DuxClientPage, DuxClientSyncStatus, DuxClientTotal } from '../types/adminClient'
import type { OrderPage } from '../types/order'
import type { AuthUser } from '../types/auth'

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const [all, withStock, withoutStock, filters, recent, pendingOrders, pendingUsers] = await Promise.all([
    apiGet<ProductPage>('/api/productos/?solo_habilitados=true&page=1&limit=1'),
    apiGet<ProductPage>('/api/productos/?solo_habilitados=true&con_stock=true&page=1&limit=1'),
    apiGet<ProductPage>('/api/productos/?solo_habilitados=true&con_stock=false&page=1&limit=1'),
    apiGet<AdminFiltersData>('/api/catalogo/filtros'),
    apiGet<ProductPage>('/api/productos/?solo_habilitados=true&page=1&limit=6&orden=recientes'),
    apiGet<OrderPage>('/api/admin/pedidos/?estado=pendiente&page=1&limit=1'),
    apiGet<AuthUser[]>('/api/admin/usuarios/pendientes'),
  ])

  return {
    totalProducts: all.total,
    productsWithStock: withStock.total,
    productsWithoutStock: withoutStock.total,
    categories: filters.categorias.length,
    brands: filters.marcas.length,
    recentProducts: recent.items,
    pendingOrders: pendingOrders.total,
    pendingConfirmations: pendingUsers.length,
  }
}

export function getAdminProducts(page: number, search = '') {
  const params = new URLSearchParams({solo_habilitados:'false',page:String(page),limit:'20',orden:'recientes'})
  if(search.trim())params.set('buscar',search.trim())
  return apiGet<AdminProductsData>(`/api/productos/?${params}`)
}

export function setProductVisibility(productId:number,visible:boolean){
  return apiPatch<{id:number;visible_tienda:boolean}>(`/api/admin/productos/${productId}/visibilidad`,{visible})
}

export function syncDuxCatalog() {
  return apiPost<DuxClientSyncStatus>('/api/admin/productos/sincronizar', {})
}

export function getDuxCatalogSyncStatus() {
  return apiGet<DuxClientSyncStatus>('/api/admin/productos/sincronizacion')
}

export function getProductAnalytics(days: number | null, grouping: 'dia' | 'semana' | 'mes' | 'anio') {
  return apiGet<ProductAnalytics>(`/api/admin/productos/analitica?dias=${days ?? 0}&agrupacion=${grouping}`)
}

export function getDuxClients(page: number, search = '') {
  const params = new URLSearchParams({ pagina: String(page), limite: '20' })
  if (search.trim()) params.set('buscar', search.trim())
  return apiGet<DuxClientPage>(`/api/admin/clientes-dux/?${params}`)
}

export function getWebClients() {
  return apiGet<AuthUser[]>('/api/admin/usuarios/')
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

export type SizeStockProduct={id:number;codigo:string;nombre:string;stock_dux:number;origen:'dux'|'manual'|'sin_configurar';talles:Record<string,number>}
export type SizeStockPage={items:SizeStockProduct[];total:number;page:number;limit:number;total_paginas:number}
export const getSizeStocks=(page:number,search:string)=>apiGet<SizeStockPage>(`/api/admin/productos/stock-talles?page=${page}&limit=20&buscar=${encodeURIComponent(search)}`)
export const saveSizeStocks=(id:number,talles:Record<string,number>)=>apiPost<{id:number;stock_dux:number;total_distribuido:number}>(`/api/admin/productos/${id}/stock-talles`,{talles:[1,2,3,4,5].map(talle=>({talle,cantidad:talles[String(talle)]||0}))})
