import type { Product } from '../types/catalog'

const NEW_PRODUCT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

export function isNewProduct(product: Pick<Product, 'fecha_creacion_dux' | 'creado_en'>, now = Date.now()) {
  const sourceDate = product.fecha_creacion_dux || product.creado_en
  if (!sourceDate) return false

  const createdAt = new Date(`${sourceDate.slice(0, 10)}T00:00:00`).getTime()
  if (!Number.isFinite(createdAt)) return false

  const age = now - createdAt
  return age >= 0 && age <= NEW_PRODUCT_WINDOW_MS
}
