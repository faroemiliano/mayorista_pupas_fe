import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { calculateCart } from "../../api/cart";
import { apiAsset } from "../../api/client";
import { createOrder } from "../../api/orders";
import { useCart } from "../../context/CartContext";
import type { Order, OrderCreateData } from "../../types/order";
import { formatCurrency } from "../../utils/currency";
import { QuantityControl } from "./QuantityControl";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { whatsappUrl } from "../../config/contact";

export function CartDrawer() {
  const cart = useCart();
  const { user } = useAuth();
  const [stage, setStage] = useState<"cart" | "review">("cart");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const calculation = useQuery({
    queryKey: [
      "cart-calculation",
      cart.items.map((item) => [item.product.id, item.quantity]),
    ],
    queryFn: () => calculateCart(cart.items),
    enabled: cart.items.length > 0,
    retry: false,
  });
  const orderMutation = useMutation({
    mutationFn: (data: OrderCreateData) => createOrder(data, cart.items),
    onSuccess: (order) => {
      setConfirmedOrder(order);
      cart.clearCart();
    },
  });

  useEffect(() => {
    document.body.style.overflow = cart.isOpen ? "hidden" : "";
    if (!cart.isOpen) {
      setStage("cart");
      setConfirmedOrder(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cart.isOpen]);

  if (!cart.isOpen) return null;

  const result = calculation.data;
  const hasDiscount = Boolean(result && Number(result.descuento_aplicado) > 0);
  const profileComplete = Boolean(
    user?.nombre &&
    user.telefono &&
    user.provincia &&
    user.localidad_partido &&
    user.domicilio,
  );

  const confirmOrder = () => {
    if (!user || !profileComplete) return;
    orderMutation.mutate({
      cliente_nombre: user.nombre,
      cliente_telefono: user.telefono || "",
      cliente_email: user.email,
      provincia: user.provincia || "",
      localidad: user.localidad_partido || "",
      direccion: user.domicilio || "",
      observaciones: null,
    });
  };

  return (
    <div
      className="cart-overlay"
      role="presentation"
      onMouseDown={cart.closeCart}
    >
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="cart-drawer-header">
          <div>
            <p className="eyebrow">PEDIDO MAYORISTA</p>
            <h2>{stage === "cart" ? "Tu carrito" : "Resumen de compra"}</h2>
          </div>
          <button
            type="button"
            onClick={cart.closeCart}
            aria-label="Cerrar carrito"
          >
            ×
          </button>
        </div>

        {confirmedOrder ? (
          <div className="overflow-y-auto px-5 py-6">
            <div className="text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-600 text-3xl text-white shadow-lg shadow-emerald-200">
                ✓
              </span>
              <p className="mt-4 text-[10px] font-extrabold tracking-[3px] text-emerald-700">
                PEDIDO CONFIRMADO
              </p>
              <h3 className="mt-1 text-2xl font-black text-[#171717]">
                ¡Recibimos tu pedido!
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                Lo revisaremos y nos comunicaremos con vos para coordinar el
                pago y la entrega.
              </p>
            </div>
            <section className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <small className="block text-[10px] font-bold tracking-widest text-[#525252]">
                    NÚMERO DE PEDIDO
                  </small>
                  <strong className="text-xl text-[#111111]">
                    {confirmedOrder.codigo}
                  </strong>
                </div>
                <button
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-bold text-[#111111]"
                  type="button"
                  onClick={() =>
                    void navigator.clipboard.writeText(confirmedOrder.codigo)
                  }
                >
                  Copiar
                </button>
              </div>
              <div className="mt-3 flex justify-between border-t border-neutral-300 pt-3 text-xs">
                <span>Estado</span>
                <strong className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                  Pendiente de revisión
                </strong>
              </div>
            </section>
            <section className="mt-5">
              <div className="flex justify-between">
                <h4 className="font-bold">Productos</h4>
                <span className="text-xs text-gray-500">
                  {confirmedOrder.cantidad_unidades} unidades
                </span>
              </div>
              <div className="mt-2 max-h-52 divide-y overflow-y-auto rounded-xl border border-gray-100 bg-white px-4">
                {confirmedOrder.items.map((item) => (
                  <article
                    className="flex justify-between gap-3 py-3 text-sm"
                    key={item.id}
                  >
                    <div>
                      <strong>{item.producto_nombre}</strong>
                      <small className="block text-gray-500">
                        {" "}
                        Talle {item.talle ?? "histórico"} · {item.cantidad} ×{" "}
                        {formatCurrency(Number(item.precio_unitario))}
                      </small>
                    </div>
                    <strong>{formatCurrency(Number(item.subtotal))}</strong>
                  </article>
                ))}
              </div>
            </section>
            <section className="mt-5 rounded-2xl bg-[#171717] p-5 text-white">
              <div className="flex justify-between text-sm text-white/70">
                <span>Total sin descuento</span>
                <span>
                  {formatCurrency(
                    Number(confirmedOrder.subtotal_sin_descuento),
                  )}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-sm text-emerald-300">
                <span>Descuento aplicado</span>
                <strong>
                  − {formatCurrency(Number(confirmedOrder.descuento_aplicado))}
                </strong>
              </div>
              <div className="mt-4 flex justify-between border-t border-white/20 pt-4">
                <span className="font-bold">Total final</span>
                <strong className="text-2xl">
                  {formatCurrency(Number(confirmedOrder.total))}
                </strong>
              </div>
              {Number(confirmedOrder.descuento_aplicado) > 0 && (
                <p className="mt-3 rounded-lg bg-white/10 p-2 text-center text-xs text-emerald-200">
                  Ahorraste{" "}
                  {formatCurrency(Number(confirmedOrder.descuento_aplicado))} en
                  este pedido.
                </p>
              )}
            </section>
            <section className="mt-5 rounded-xl border border-gray-100 p-4 text-sm">
              <strong>Entrega</strong>
              <p className="mt-1 text-gray-600">
                {confirmedOrder.direccion}, {confirmedOrder.localidad},{" "}
                {confirmedOrder.provincia}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Contacto: {confirmedOrder.cliente_telefono}
                {confirmedOrder.cliente_email
                  ? ` · ${confirmedOrder.cliente_email}`
                  : ""}
              </p>
            </section>
            <div className="mt-5 grid gap-2">
              <a
                  className="rounded-xl bg-emerald-600 p-3 text-center font-bold text-white no-underline"
                  target="_blank"
                  rel="noreferrer"
                  href={whatsappUrl(`Hola, realicé el pedido ${confirmedOrder.codigo} por ${formatCurrency(Number(confirmedOrder.total))}.`)}
                >
                  Consultar por WhatsApp
                </a>
              <Link
                className="rounded-xl border border-[#111111] p-3 text-center font-bold text-[#111111] no-underline"
                to="/mi-cuenta"
                onClick={cart.closeCart}
              >
                Ver en Mi cuenta
              </Link>
              <button
                className="rounded-xl bg-gray-100 p-3 font-bold text-gray-700"
                type="button"
                onClick={cart.closeCart}
              >
                Seguir comprando
              </button>
            </div>
          </div>
        ) : cart.items.length === 0 ? (
          <div className="cart-empty">
            <span className="grid size-14 place-items-center rounded-full border border-neutral-300">
              <svg
                className="size-7 fill-none stroke-current"
                viewBox="0 0 24 24"
                strokeWidth="1.4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.5 8.5h13l-1 11h-11l-1-11Z"
                />
                <path strokeLinecap="round" d="M9 9V6.5a3 3 0 0 1 6 0V9" />
              </svg>
            </span>
            <h3>Tu carrito está vacío</h3>
            <p>Elegí productos del catálogo para comenzar.</p>
            <button type="button" onClick={cart.closeCart}>
              Ver catálogo
            </button>
          </div>
        ) : stage === "cart" ? (
          <>
            <div className="cart-progress">
              {result?.aplica_precio_24_productos ? (
                <strong>¡Precio especial por 24 productos aplicado!</strong>
              ) : (
                <>
                  <strong>
                    Sumá {result?.faltantes_para_precio_24 ?? "…"} unidades más
                  </strong>
                  <span>para acceder al precio especial.</span>
                </>
              )}
            </div>
            {result && (
              <div
                className={`mx-5 mt-3 rounded-xl p-3 text-sm ${result.cumple_compra_minima ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}
              >
                {result.cumple_compra_minima ? (
                  <strong>
                    ✓ Alcanzaste la compra mínima de{" "}
                    {result.compra_minima_unidades} prendas.
                  </strong>
                ) : (
                  <>
                    <strong>
                      Sumá {result.faltantes_para_compra_minima}{" "}
                      {result.faltantes_para_compra_minima === 1
                        ? "prenda más"
                        : "prendas más"}
                    </strong>
                    <span className="block text-xs">
                      Podés combinar cualquier producto del catálogo.
                    </span>
                  </>
                )}
              </div>
            )}
            <div className="cart-lines">
              {cart.items.map((item) => {
                const calculated = result?.items.find(
                  (line) =>
                    line.producto_id === item.product.id &&
                    line.talle === item.talle,
                );
                return (
                  <article
                    className="cart-line"
                    key={`${item.product.id}-${item.talle}`}
                  >
                    <div className="cart-line-image">
                      {item.product.imagen_url ? (
                        <img
                          src={apiAsset(
                            `/api/productos/${item.product.id}/imagen`,
                          )}
                          alt=""
                        />
                      ) : (
                        <span>👙</span>
                      )}
                    </div>
                    <div className="cart-line-info">
                      <strong>{item.product.nombre}</strong>
                      <small>
                        Talle {item.talle} ·{" "}
                        {calculated
                          ? `${formatCurrency(Number(calculated.precio_unitario))} c/u`
                          : "Calculando precio…"}
                      </small>
                      <QuantityControl
                        compact
                        value={item.quantity}
                        max={
                          item.product.talles.find(
                            (size) => size.talle === item.talle,
                          )?.disponible ?? 0
                        }
                        onChange={(quantity) =>
                          cart.updateQuantity(
                            item.product.id,
                            item.talle,
                            quantity,
                          )
                        }
                      />
                    </div>
                    <div className="cart-line-end">
                      <button
                        type="button"
                        onClick={() =>
                          cart.removeItem(item.product.id, item.talle)
                        }
                        aria-label={`Eliminar ${item.product.nombre}, talle ${item.talle}`}
                      >
                        ×
                      </button>
                      <strong>
                        {calculated
                          ? formatCurrency(Number(calculated.subtotal))
                          : "—"}
                      </strong>
                    </div>
                  </article>
                );
              })}
            </div>
            {calculation.isError && (
              <p className="cart-error">{calculation.error.message}</p>
            )}
            <div className="cart-summary">
              <div>
                <span>Productos diferentes</span>
                <strong>
                  {result?.cantidad_productos_diferentes ?? cart.items.length}
                </strong>
              </div>
              <div>
                <span>Unidades totales</span>
                <strong>{result?.cantidad_unidades ?? cart.totalUnits}</strong>
              </div>
              <div
                className={`original-total ${hasDiscount ? "discounted" : ""}`}
              >
                <span>Total sin descuento</span>
                <strong>
                  {result
                    ? formatCurrency(Number(result.subtotal_sin_descuento))
                    : "Calculando…"}
                </strong>
              </div>
              <div className={`discount-row ${hasDiscount ? "active" : ""}`}>
                <span>Descuento aplicado</span>
                <strong>
                  {result
                    ? `− ${formatCurrency(Number(result.descuento_aplicado))}`
                    : "Calculando…"}
                </strong>
              </div>
              <div className="cart-total">
                <span>Total a pagar</span>
                <strong>
                  {result
                    ? formatCurrency(Number(result.total))
                    : "Calculando…"}
                </strong>
              </div>
              <button
                className="checkout-button"
                type="button"
                disabled={!result || !result.cumple_compra_minima}
                onClick={() => setStage("review")}
              >
                {result && !result.cumple_compra_minima
                  ? "Completá la compra mínima"
                  : "Revisar compra"}
              </button>
              <button
                className="clear-cart"
                type="button"
                onClick={cart.clearCart}
              >
                Vaciar carrito
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="review-notice">
              <strong>Revisá todos los detalles</strong>
              <span>
                Estos serán los valores que se enviarán al confirmar el pedido.
              </span>
            </div>
            <div className="cart-lines review-lines">
              {result?.items.map((item) => (
                <article
                  className="review-line"
                  key={`${item.producto_id}-${item.talle}`}
                >
                  <div>
                    <strong>{item.nombre}</strong>
                    <small>
                      Talle {item.talle} · {item.cantidad}{" "}
                      {item.cantidad === 1 ? "unidad" : "unidades"}
                    </small>
                  </div>
                  <div className="review-prices">
                    {Number(item.descuento_aplicado) > 0 && (
                      <small>
                        {formatCurrency(Number(item.precio_mayorista))} c/u
                      </small>
                    )}
                    <span>
                      {formatCurrency(Number(item.precio_unitario))} c/u
                    </span>
                    <strong>{formatCurrency(Number(item.subtotal))}</strong>
                  </div>
                </article>
              ))}
            </div>
            <div className="cart-summary review-summary">
              <div>
                <span>Productos diferentes</span>
                <strong>{result?.cantidad_productos_diferentes}</strong>
              </div>
              <div>
                <span>Unidades totales</span>
                <strong>{result?.cantidad_unidades}</strong>
              </div>
              <div
                className={`original-total ${hasDiscount ? "discounted" : ""}`}
              >
                <span>Total sin descuento</span>
                <strong>
                  {result
                    ? formatCurrency(Number(result.subtotal_sin_descuento))
                    : "—"}
                </strong>
              </div>
              <div className={`discount-row ${hasDiscount ? "active" : ""}`}>
                <span>Descuento aplicado</span>
                <strong>
                  {result
                    ? `− ${formatCurrency(Number(result.descuento_aplicado))}`
                    : "—"}
                </strong>
              </div>
              <div className="cart-total">
                <span>Total final a pagar</span>
                <strong>
                  {result ? formatCurrency(Number(result.total)) : "—"}
                </strong>
              </div>
              <section className="mt-5 border border-neutral-200 bg-neutral-50 p-4 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <strong>Datos de tu cuenta</strong>
                    <p className="mt-1 text-neutral-600">
                      Usaremos esta información para registrar y coordinar el
                      pedido.
                    </p>
                  </div>
                  <Link
                    className="text-xs font-bold text-black"
                    to="/mi-cuenta?seccion=profile"
                    onClick={cart.closeCart}
                  >
                    Editar
                  </Link>
                </div>
                {profileComplete ? (
                  <div className="mt-4 space-y-1 border-t border-neutral-200 pt-4">
                    <p>
                      <strong>{user?.nombre}</strong>
                    </p>
                    <p>
                      {user?.domicilio}, {user?.localidad_partido},{" "}
                      {user?.provincia}
                    </p>
                    <p>
                      {user?.telefono} · {user?.email}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 border border-amber-200 bg-amber-50 p-3 text-amber-900">
                    <strong>Faltan datos en tu cuenta</strong>
                    <p className="mt-1 text-xs">
                      Completá teléfono, provincia, localidad y domicilio una
                      sola vez para confirmar pedidos.
                    </p>
                    <Link
                      className="mt-3 inline-block bg-black px-4 py-2 text-xs font-bold text-white no-underline"
                      to="/mi-cuenta?seccion=profile"
                      onClick={cart.closeCart}
                    >
                      Completar mis datos
                    </Link>
                  </div>
                )}
              </section>
              {orderMutation.isError && (
                <p className="cart-error">{orderMutation.error.message}</p>
              )}
              <button
                className="checkout-button"
                type="button"
                disabled={!profileComplete || orderMutation.isPending}
                onClick={confirmOrder}
              >
                {orderMutation.isPending
                  ? "Enviando pedido…"
                  : "Confirmar pedido"}
              </button>
              <button
                className="back-to-cart"
                type="button"
                onClick={() => setStage("cart")}
              >
                ← Modificar carrito
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
