import { apiPost, apiPut } from './client'
import type { CartCalculation, CartItem } from '../types/cart'

export function calculateCart(items: CartItem[]) {
  return apiPost<CartCalculation>('/api/carrito/calcular', {
    items: items.map((item) => ({
      producto_id: item.product.id,
      talle: item.talle,
      cantidad: item.quantity,
    })),
  })
}

export function reserveCart(items: CartItem[]) {
  return apiPut<{items:Array<{producto_id:number;talle:string;cantidad:number}>;expira_en:string|null}>('/api/carrito/reserva', {
    items: items.map(item => ({ producto_id:item.product.id, talle:item.talle, cantidad:item.quantity })),
  })
}
