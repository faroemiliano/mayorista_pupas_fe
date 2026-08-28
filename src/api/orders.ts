import { apiGet, apiPatch, apiPost } from './client'
import type { CartItem } from '../types/cart'
import type { Order, OrderCreateData, OrderPage, OrderStatus } from '../types/order'

export function createOrder(data: OrderCreateData, items: CartItem[]) {
  return apiPost<Order>('/api/pedidos/', {
    ...data,
    items: items.map((item) => ({
      producto_id: item.product.id,
      cantidad: item.quantity,
    })),
  })
}

export function getAdminOrders(status: string, page: number) {
  const params = new URLSearchParams({ page: String(page), limit: '20' })
  if (status) params.set('estado', status)
  return apiGet<OrderPage>(`/api/admin/pedidos/?${params}`)
}

export function getMyOrders(page: number) {
  return apiGet<OrderPage>(`/api/pedidos/mios?page=${page}&limit=10`)
}

export function updateOrderStatus(orderId: number, status: OrderStatus) {
  return apiPatch<Order>(`/api/admin/pedidos/${orderId}/estado`, { estado: status })
}

export function sendOrderToDux(orderId:number,idPersonal:number){
  return apiPost<Order>(`/api/admin/pedidos/${orderId}/enviar-dux`,{id_personal:idPersonal})
}
