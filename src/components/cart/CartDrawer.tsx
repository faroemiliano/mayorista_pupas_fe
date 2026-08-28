import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { calculateCart } from '../../api/cart'
import { apiAsset } from '../../api/client'
import { createOrder } from '../../api/orders'
import { useCart } from '../../context/CartContext'
import type { Order, OrderCreateData } from '../../types/order'
import { formatCurrency } from '../../utils/currency'
import { QuantityControl } from './QuantityControl'

export function CartDrawer() {
  const cart = useCart()
  const [stage, setStage] = useState<'cart' | 'review'>('cart')
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)
  const calculation = useQuery({
    queryKey: ['cart-calculation', cart.items.map((item) => [item.product.id, item.quantity])],
    queryFn: () => calculateCart(cart.items),
    enabled: cart.items.length > 0,
    retry: false,
  })
  const orderMutation = useMutation({
    mutationFn: (data: OrderCreateData) => createOrder(data, cart.items),
    onSuccess: (order) => {
      setConfirmedOrder(order)
      cart.clearCart()
    },
  })

  useEffect(() => {
    document.body.style.overflow = cart.isOpen ? 'hidden' : ''
    if (!cart.isOpen) setStage('cart')
    return () => { document.body.style.overflow = '' }
  }, [cart.isOpen])

  if (!cart.isOpen) return null

  const result = calculation.data
  const hasDiscount = Boolean(result && Number(result.descuento_aplicado) > 0)

  return (
    <div className="cart-overlay" role="presentation" onMouseDown={cart.closeCart}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Tu pedido" onMouseDown={(event) => event.stopPropagation()}>
        <div className="cart-drawer-header">
          <div><p className="eyebrow">PEDIDO MAYORISTA</p><h2>{stage === 'cart' ? 'Tu carrito' : 'Resumen de compra'}</h2></div>
          <button type="button" onClick={cart.closeCart} aria-label="Cerrar carrito">×</button>
        </div>

        {confirmedOrder ? (
          <div className="order-success"><span>✓</span><p className="eyebrow">PEDIDO RECIBIDO</p><h3>¡Gracias por tu compra!</h3><p>Guardá este código para consultar tu pedido:</p><strong>{confirmedOrder.codigo}</strong><div><span>Total final</span><b>{formatCurrency(Number(confirmedOrder.total))}</b></div><small>El pedido quedó pendiente de revisión. Nos comunicaremos con vos para coordinar el pago y la entrega.</small><button type="button" onClick={cart.closeCart}>Volver a la tienda</button></div>
        ) : cart.items.length === 0 ? (
          <div className="cart-empty"><span>🛍️</span><h3>Tu carrito está vacío</h3><p>Elegí productos del catálogo para comenzar.</p><button type="button" onClick={cart.closeCart}>Ver catálogo</button></div>
        ) : stage === 'cart' ? (
          <>
            <div className="cart-progress">
              {result?.aplica_precio_24_productos
                ? <strong>¡Precio especial por 24 productos aplicado!</strong>
                : <><strong>Sumá {result?.faltantes_para_precio_24 ?? '…'} unidades más</strong><span>para acceder al precio especial.</span></>}
            </div>
            <div className="cart-lines">
              {cart.items.map((item) => {
                const calculated = result?.items.find((line) => line.producto_id === item.product.id)
                return <article className="cart-line" key={item.product.id}>
                  <div className="cart-line-image">{item.product.imagen_url ? <img src={apiAsset(`/api/productos/${item.product.id}/imagen`)} alt=""/> : <span>👙</span>}</div>
                  <div className="cart-line-info"><strong>{item.product.nombre}</strong><small>{calculated ? `${formatCurrency(Number(calculated.precio_unitario))} c/u` : 'Calculando precio…'}</small><QuantityControl compact value={item.quantity} max={Math.floor(Number(item.product.stock_disponible))} onChange={(quantity) => cart.updateQuantity(item.product.id, quantity)}/></div>
                  <div className="cart-line-end"><button type="button" onClick={() => cart.removeItem(item.product.id)} aria-label={`Eliminar ${item.product.nombre}`}>×</button><strong>{calculated ? formatCurrency(Number(calculated.subtotal)) : '—'}</strong></div>
                </article>
              })}
            </div>
            {calculation.isError && <p className="cart-error">{calculation.error.message}</p>}
            <div className="cart-summary">
              <div><span>Productos diferentes</span><strong>{result?.cantidad_productos_diferentes ?? cart.items.length}</strong></div>
              <div><span>Unidades totales</span><strong>{result?.cantidad_unidades ?? cart.totalUnits}</strong></div>
              <div className={`original-total ${hasDiscount ? 'discounted' : ''}`}><span>Total sin descuento</span><strong>{result ? formatCurrency(Number(result.subtotal_sin_descuento)) : 'Calculando…'}</strong></div>
              <div className={`discount-row ${hasDiscount ? 'active' : ''}`}><span>Descuento aplicado</span><strong>{result ? `− ${formatCurrency(Number(result.descuento_aplicado))}` : 'Calculando…'}</strong></div>
              <div className="cart-total"><span>Total a pagar</span><strong>{result ? formatCurrency(Number(result.total)) : 'Calculando…'}</strong></div>
              <button className="checkout-button" type="button" disabled={!result} onClick={() => setStage('review')}>Revisar compra</button>
              <button className="clear-cart" type="button" onClick={cart.clearCart}>Vaciar carrito</button>
            </div>
          </>
        ) : (
          <>
            <div className="review-notice"><strong>Revisá todos los detalles</strong><span>Estos serán los valores que se enviarán al confirmar el pedido.</span></div>
            <div className="cart-lines review-lines">
              {result?.items.map((item) => <article className="review-line" key={item.producto_id}>
                <div><strong>{item.nombre}</strong><small>{item.cantidad} {item.cantidad === 1 ? 'unidad' : 'unidades'}</small></div>
                <div className="review-prices">
                  {Number(item.descuento_aplicado) > 0 && <small>{formatCurrency(Number(item.precio_mayorista))} c/u</small>}
                  <span>{formatCurrency(Number(item.precio_unitario))} c/u</span>
                  <strong>{formatCurrency(Number(item.subtotal))}</strong>
                </div>
              </article>)}
            </div>
            <div className="cart-summary review-summary">
              <div><span>Productos diferentes</span><strong>{result?.cantidad_productos_diferentes}</strong></div>
              <div><span>Unidades totales</span><strong>{result?.cantidad_unidades}</strong></div>
              <div className={`original-total ${hasDiscount ? 'discounted' : ''}`}><span>Total sin descuento</span><strong>{result ? formatCurrency(Number(result.subtotal_sin_descuento)) : '—'}</strong></div>
              <div className={`discount-row ${hasDiscount ? 'active' : ''}`}><span>Descuento aplicado</span><strong>{result ? `− ${formatCurrency(Number(result.descuento_aplicado))}` : '—'}</strong></div>
              <div className="cart-total"><span>Total final a pagar</span><strong>{result ? formatCurrency(Number(result.total)) : '—'}</strong></div>
              <form className="checkout-form" onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault()
                const form = new FormData(event.currentTarget)
                orderMutation.mutate({
                  cliente_nombre: String(form.get('nombre') || ''),
                  cliente_telefono: String(form.get('telefono') || ''),
                  cliente_email: String(form.get('email') || '') || null,
                  provincia: String(form.get('provincia') || ''),
                  localidad: String(form.get('localidad') || ''),
                  direccion: String(form.get('direccion') || ''),
                  observaciones: String(form.get('observaciones') || '') || null,
                })
              }}>
                <h3>Datos para completar el pedido</h3>
                <label>Nombre y apellido<input name="nombre" required minLength={2}/></label>
                <label>Teléfono<input name="telefono" type="tel" required minLength={6}/></label>
                <label>Email <small>(opcional)</small><input name="email" type="email"/></label>
                <div><label>Provincia<input name="provincia" required minLength={2}/></label><label>Localidad<input name="localidad" required minLength={2}/></label></div>
                <label>Dirección<input name="direccion" required minLength={4}/></label>
                <label>Observaciones <small>(opcional)</small><textarea name="observaciones" rows={2}/></label>
                {orderMutation.isError && <p className="cart-error">{orderMutation.error.message}</p>}
                <button className="checkout-button" type="submit" disabled={orderMutation.isPending}>{orderMutation.isPending ? 'Enviando pedido…' : 'Confirmar pedido'}</button>
              </form>
              <button className="back-to-cart" type="button" onClick={() => setStage('cart')}>← Modificar carrito</button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
