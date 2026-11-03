import { apiPost } from './client'
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
