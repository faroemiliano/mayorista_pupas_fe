import type { CartCalculationItem } from './cart'

export type OrderStatus = 'pendiente' | 'contactado' | 'confirmado' | 'cancelado'

export type OrderCreateData = {
  cliente_nombre: string
  cliente_telefono: string
  cliente_email: string | null
  provincia: string
  localidad: string
  direccion: string
  observaciones: string | null
}

export type Order = {
  id: number
  codigo: string
  estado: OrderStatus
  cliente_nombre: string
  cliente_telefono: string
  cliente_email: string | null
  provincia: string
  localidad: string
  direccion: string
  observaciones: string | null
  cantidad_productos_diferentes: number
  cantidad_unidades: number
  aplica_precio_24_productos: boolean
  subtotal_sin_descuento: string
  descuento_aplicado: string
  total: string
  creado_en: string
  dux_id_pedido: number | null
  dux_nro_pedido: number | null
  dux_id_personal: number | null
  estado_sync_dux: 'pendiente'|'enviando'|'enviado'|'error'
  error_sync_dux: string | null
  sincronizado_dux_en: string | null
  items: Array<CartCalculationItem & { id: number; producto_nombre: string }>
}

export type OrderPage = {
  items: Order[]
  total: number
  page: number
  limit: number
  total_paginas: number
}
