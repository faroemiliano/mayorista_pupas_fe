import { apiGet, apiPatch, apiPost } from './client'
import type { CartItem } from '../types/cart'
import type { Order, OrderCreateData, OrderPage, OrderStatus } from '../types/order'

export function createOrder(data: OrderCreateData, items: CartItem[]) {
  return apiPost<Order>('/api/pedidos/', {
    ...data,
    items: items.map((item) => ({
      producto_id: item.product.id,
      talle: item.talle,
      cantidad: item.quantity,
    })),
  })
}

export function getAdminOrders(status: string, page: number, buscar = '', fechaDesde = '', fechaHasta = '', origen = 'todos', orden = 'fecha_desc') {
  const params = new URLSearchParams({ page: String(page), limit: '20' })
  params.set('origen', origen)
  params.set('orden', orden)
  if (status) params.set('estado', status)
  if (buscar.trim()) params.set('buscar', buscar.trim())
  if (fechaDesde) params.set('fecha_desde', fechaDesde)
  if (fechaHasta) params.set('fecha_hasta', fechaHasta)
  return apiGet<OrderPage>(`/api/admin/pedidos/?${params}`)
}

export function getAdminOrder(orderId:number){
  return apiGet<Order>(`/api/admin/pedidos/${orderId}`)
}

export function getMyOrders(page: number) {
  return apiGet<OrderPage>(`/api/pedidos/mios?page=${page}&limit=10`)
}

export function updateOrderStatus(orderId: number, status: OrderStatus, origin: Order['origen']) {
  return apiPatch<Order>(`/api/admin/pedidos/${orderId}/estado`, { estado: status, origen: origin })
}

export function updateOrderStatuses(orders: Array<{ id: number; origen: Order['origen'] }>, status: OrderStatus) {
  return apiPatch<{ actualizados: number; sin_cambios: number }>("/api/admin/pedidos/estado-lote", {
    estado: status,
    pedidos: orders,
  })
}

export function sendOrderToDux(orderId:number,idPersonal:number){
  return apiPost<Order>(`/api/admin/pedidos/${orderId}/enviar-dux`,{id_personal:idPersonal})
}
