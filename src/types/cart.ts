import type { Product } from './catalog'

export type CartItem = {
  product: Product
  quantity: number
  talle: number
}

export type CartCalculationItem = {
  producto_id: number
  dux_codigo: string
  nombre: string
  slug: string
  imagen_url: string | null
  cantidad: number
  talle: number
  precio_mayorista: string
  precio_unitario: string
  subtotal_sin_descuento: string
  descuento_aplicado: string
  subtotal: string
}

export type CartCalculation = {
  items: CartCalculationItem[]
  cantidad_productos_diferentes: number
  cantidad_unidades: number
  aplica_precio_24_productos: boolean
  faltantes_para_precio_24: number
  subtotal_sin_descuento: string
  descuento_aplicado: string
  total: string
  compra_minima_unidades: number
  faltantes_para_compra_minima: number
  cumple_compra_minima: boolean
}
