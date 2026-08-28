import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getAdminOrders,
  sendOrderToDux,
  updateOrderStatus,
} from "../../api/orders";
import type { OrderStatus } from "../../types/order";
import { formatCurrency } from "../../utils/currency";
import { getDuxConfiguration } from "../../api/admin";

const states: OrderStatus[] = [
  "pendiente",
  "contactado",
  "confirmado",
  "cancelado",
];

export function AdminOrders() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [personal, setPersonal] = useState(1051689);
  const queryClient = useQueryClient();
  const orders = useQuery({
    queryKey: ["admin-orders", status, page],
    queryFn: () => getAdminOrders(status, page),
  });
  const duxConfiguration = useQuery({ queryKey: ["dux-configuration"], queryFn: getDuxConfiguration });
  const duxWritingEnabled = duxConfiguration.data?.escritura_habilitada === true;
  const update = useMutation({
    mutationFn: ({ id, next }: { id: number; next: OrderStatus }) =>
      updateOrderStatus(id, next),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
  });
  const selected = orders.data?.items.find((order) => order.id === selectedId);
  const sendDux = useMutation({
    mutationFn: ({ id, idPersonal }: { id: number; idPersonal: number }) =>
      sendOrderToDux(id, idPersonal),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">GESTIÓN COMERCIAL</p>
          <h1>Pedidos</h1>
          <span>Compras recibidas desde la tienda mayorista.</span>
        </div>
        <select
          className="admin-filter"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos los estados</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </header>
      <section className="admin-panel-card admin-table-card">
        <div className="admin-card-header">
          <div>
            <h2>{orders.data?.total ?? 0} pedidos</h2>
            <p>Ordenados desde el más reciente.</p>
          </div>
        </div>
        {orders.isLoading ? (
          <div className="admin-status">
            <span className="loader" />
          </div>
        ) : orders.data?.items.length === 0 ? (
          <div className="admin-status">
            <strong>Todavía no hay pedidos</strong>
            <p>Las compras confirmadas aparecerán aquí.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Unidades</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.data?.items.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.codigo}</strong>
                    </td>
                    <td>
                      <strong>{order.cliente_nombre}</strong>
                      <small>{order.cliente_telefono}</small>
                    </td>
                    <td>{new Date(order.creado_en).toLocaleString("es-AR")}</td>
                    <td>{order.cantidad_unidades}</td>
                    <td>
                      <strong>{formatCurrency(Number(order.total))}</strong>
                    </td>
                    <td>
                      <select
                        className={`order-state ${order.estado}`}
                        value={order.estado}
                        disabled={update.isPending}
                        onChange={(event) =>
                          update.mutate({
                            id: order.id,
                            next: event.target.value as OrderStatus,
                          })
                        }
                      >
                        {states.map((state) => (
                          <option key={state}>{state}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="order-detail-button"
                        onClick={() => setSelectedId(order.id)}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {orders.data && orders.data.total_paginas > 1 && (
          <nav className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
            >
              ← Anterior
            </button>
            <span>
              Página {page} de {orders.data.total_paginas}
            </span>
            <button
              disabled={page >= orders.data.total_paginas}
              onClick={() => setPage((value) => value + 1)}
            >
              Siguiente →
            </button>
          </nav>
        )}
      </section>
      {selected && (
        <div className="order-modal" onMouseDown={() => setSelectedId(null)}>
          <aside onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <p className="eyebrow">{selected.codigo}</p>
                <h2>Detalle del pedido</h2>
              </div>
              <button onClick={() => setSelectedId(null)}>×</button>
            </header>
            <section className="order-customer">
              <strong>{selected.cliente_nombre}</strong>
              <span>
                {selected.cliente_telefono} ·{" "}
                {selected.cliente_email || "Sin email"}
              </span>
              <span>
                {selected.direccion}, {selected.localidad}, {selected.provincia}
              </span>
              {selected.observaciones && <p>{selected.observaciones}</p>}
            </section>
            <div className="order-items">
              {selected.items.map((item) => (
                <article key={item.id}>
                  <div>
                    <strong>{item.producto_nombre}</strong>
                    <small>
                      Código Dux: {item.dux_codigo} · {item.cantidad} unidades
                    </small>
                  </div>
                  <span>{formatCurrency(Number(item.subtotal))}</span>
                </article>
              ))}
            </div>
            <section className="m-5 rounded-lg border border-rose-100 bg-rose-50 p-4">
              <strong>Sincronización con Dux</strong>
              {selected.estado_sync_dux === 'enviado' ? (
                <p className="mt-2 text-sm text-emerald-700">Enviado · Pedido Dux #{selected.dux_nro_pedido || selected.dux_id_pedido}</p>
              ) : <>
                <div className="mt-3 flex gap-2">
                  <select className="admin-filter grow" value={personal} onChange={(event) => setPersonal(Number(event.target.value))}>
                    <option value={1051689}>Romina Tiecher</option>
                    <option value={796900}>Julio</option>
                  </select>
                  <button className="rounded-md bg-[#722f55] px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={sendDux.isPending || !duxWritingEnabled} onClick={() => sendDux.mutate({ id: selected.id, idPersonal: personal })}>
                    {!duxWritingEnabled ? 'Bloqueado en desarrollo' : sendDux.isPending ? 'Enviando…' : selected.estado_sync_dux === 'error' ? 'Reintentar' : 'Enviar a Dux'}
                  </button>
                </div>
                {!duxWritingEnabled && <p className="mt-2 text-xs text-amber-800">La escritura en Dux está deshabilitada por seguridad.</p>}
                {selected.error_sync_dux && <p className="mt-2 text-xs text-red-700">{selected.error_sync_dux}</p>}
                {sendDux.isError && <p className="mt-2 text-xs text-red-700">{sendDux.error.message}</p>}
              </>}
            </section>
            <footer className="order-totals">
              <div>
                <span>Total sin descuento</span>
                <strong>
                  {formatCurrency(Number(selected.subtotal_sin_descuento))}
                </strong>
              </div>
              <div className="discount-row">
                <span>Descuento</span>
                <strong>
                  − {formatCurrency(Number(selected.descuento_aplicado))}
                </strong>
              </div>
              <div>
                <span>Total final</span>
                <strong>{formatCurrency(Number(selected.total))}</strong>
              </div>
            </footer>
          </aside>
        </div>
      )}
    </div>
  );
}
