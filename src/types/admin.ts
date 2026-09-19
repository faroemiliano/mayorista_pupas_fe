import type { CatalogFilters, ProductPage } from './catalog'

export type AdminDashboardData = {
  totalProducts: number
  productsWithStock: number
  productsWithoutStock: number
  categories: number
  brands: number
  recentProducts: ProductPage['items']
  pendingOrders: number
  pendingConfirmations: number
}

export type AdminProductsData = ProductPage

export type AdminFiltersData = CatalogFilters

export type ProductSalesRanking = {
  producto_id: number
  dux_codigo: string
  nombre: string
  unidades_vendidas: number
  cantidad_pedidos: number
  importe_vendido: string
  stock_disponible: string
}

export type ProductAnalytics = {
  origen: 'pedidos_tienda'
  alcance: string
  dias: number | null
  desde: string | null
  hasta: string
  resumen: {
    unidades_vendidas: number
    importe_vendido: string
    productos_con_ventas: number
    productos_sin_ventas: number
  }
  agrupacion: 'dia' | 'semana' | 'mes' | 'anio'
  serie_ventas: Array<{
    clave: string
    etiqueta: string
    inicio: string
    pedidos: number
    unidades: number
    importe: string
    variacion_porcentual: number | null
  }>
  mas_vendidos: ProductSalesRanking[]
  menos_vendidos: ProductSalesRanking[]
  sin_ventas: ProductSalesRanking[]
}
