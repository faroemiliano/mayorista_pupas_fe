import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getAdminOrder,
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

const stateLabels: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  contactado: "Contactado",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
};

const stateStyles: Record<OrderStatus, string> = {
  pendiente: "border-amber-200 bg-amber-50 text-amber-800",
  contactado: "border-blue-200 bg-blue-50 text-blue-800",
  confirmado: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cancelado: "border-red-200 bg-red-50 text-red-800",
};

export function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedId = Number(searchParams.get("pedido_id")) || null;
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [month, setMonth] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [personal, setPersonal] = useState(1051689);
  const queryClient = useQueryClient();
  const orders = useQuery({
    queryKey: ["admin-orders", status, search, dateFrom, dateTo, page],
    queryFn: () => getAdminOrders(status, page, search, dateFrom, dateTo),
  });
  const requestedOrder = useQuery({
    queryKey: ["admin-order", requestedId],
    queryFn: () => getAdminOrder(requestedId!),
    enabled: requestedId !== null,
  });
  const duxConfiguration = useQuery({ queryKey: ["dux-configuration"], queryFn: getDuxConfiguration });
  const duxWritingEnabled = duxConfiguration.data?.escritura_habilitada === true;
  const update = useMutation({
    mutationFn: ({ id, next }: { id: number; next: OrderStatus }) =>
      updateOrderStatus(id, next),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
  });
  const selected = requestedOrder.data ?? orders.data?.items.find((order) => order.id === selectedId);
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
      </header>
      <section className="grid gap-4 border border-neutral-200 bg-white p-5 md:grid-cols-2 xl:grid-cols-5">
        <label className="text-xs font-bold xl:col-span-2">Pedido o cliente<input className="admin-filter mt-2 w-full" value={search} onChange={(event)=>{setSearch(event.target.value);setPage(1)}} placeholder="Código, ID, nombre, email o teléfono"/></label>
        <label className="text-xs font-bold">Mes completo<input className="admin-filter mt-2 w-full" type="month" value={month} onChange={(event)=>{const value=event.target.value;setMonth(value);if(value){const [year,monthNumber]=value.split('-').map(Number);const lastDay=new Date(year,monthNumber,0).getDate();setDateFrom(`${value}-01`);setDateTo(`${value}-${String(lastDay).padStart(2,'0')}`)}else{setDateFrom('');setDateTo('')}setPage(1)}}/></label>
        <label className="text-xs font-bold">Desde<input className="admin-filter mt-2 w-full" type="date" value={dateFrom} onChange={(event)=>{setDateFrom(event.target.value);setMonth('');setPage(1)}}/></label>
        <label className="text-xs font-bold">Hasta<input className="admin-filter mt-2 w-full" type="date" min={dateFrom||undefined} value={dateTo} onChange={(event)=>{setDateTo(event.target.value);setMonth('');setPage(1)}}/></label>
        <div className="flex flex-wrap items-end gap-3 md:col-span-2 xl:col-span-5"><label className="grow text-xs font-bold sm:max-w-52">Estado<select className="admin-filter mt-2 w-full" value={status} onChange={(event)=>{setStatus(event.target.value);setPage(1)}}><option value="">Todos los estados</option>{states.map((state)=><option key={state} value={state}>{state}</option>)}</select></label><button className="h-10 border border-neutral-300 px-4 text-xs font-bold disabled:opacity-40" type="button" disabled={!search&&!status&&!dateFrom&&!dateTo} onClick={()=>{setSearch('');setStatus('');setDateFrom('');setDateTo('');setMonth('');setPage(1)}}>Limpiar filtros</button></div>
      </section>
      <section className="admin-panel-card admin-table-card">
        <div className="admin-card-header">
          <div>
            <h2>{orders.data?.total ?? 0} pedidos encontrados</h2>
            <p>{dateFrom||dateTo?`Período: ${dateFrom||'inicio'} al ${dateTo||'hoy'}`:'Ordenados desde el más reciente.'}</p>
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
                        onClick={() => { setSearchParams({}); setSelectedId(order.id) }}
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
        <div className="order-modal !bg-black/75 backdrop-blur-sm" onMouseDown={() => { setSelectedId(null); setSearchParams({}) }}>
          <aside className="!max-h-[94vh] !max-w-5xl !overflow-y-auto !rounded-3xl !bg-[#f4f4f2] shadow-[0_30px_100px_rgba(0,0,0,.45)] [scrollbar-gutter:stable]" onMouseDown={(event) => event.stopPropagation()}>
            <header className="sticky top-0 z-20 !items-start !border-b-0 !bg-neutral-950 !px-6 !py-5 !text-white sm:!px-8 sm:!py-6">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.24em] text-white/50">GESTIÓN DE PEDIDO</p>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1"><h2 className="font-serif text-3xl sm:text-4xl">{selected.codigo}</h2><span className="text-xs text-white/55">{new Date(selected.creado_en).toLocaleString("es-AR", { dateStyle: "long", timeStyle: "short" })}</span></div>
              </div>
              <button className="grid size-10 place-items-center rounded-full border border-white/20 text-2xl text-white transition hover:bg-white hover:text-black" aria-label="Cerrar detalle" onClick={() => { setSelectedId(null); setSearchParams({}) }}>×</button>
            </header>

            <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-[1fr_1fr_auto]">
              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <p className="eyebrow">CLIENTE</p>
                <strong className="mt-2 block text-lg">{selected.cliente_nombre}</strong>
                <a className="mt-3 flex items-center gap-2 text-sm text-neutral-700 no-underline hover:text-black" href={`tel:${selected.cliente_telefono}`}><span className="grid size-7 place-items-center rounded-full bg-neutral-100 text-xs">☎</span>{selected.cliente_telefono}</a>
                {selected.cliente_email ? <a className="mt-2 flex items-center gap-2 break-all text-sm text-neutral-500 no-underline hover:text-black" href={`mailto:${selected.cliente_email}`}><span className="grid size-7 shrink-0 place-items-center rounded-full bg-neutral-100 text-xs">@</span>{selected.cliente_email}</a> : <span className="mt-2 block text-sm text-neutral-400">Email no informado</span>}
              </section>
              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <p className="eyebrow">ENTREGA</p>
                <strong className="mt-2 block text-sm">{selected.direccion}</strong>
                <span className="mt-1 block text-sm text-neutral-500">{selected.localidad}, {selected.provincia}</span>
                {selected.observaciones && <div className="mt-4 rounded-xl bg-amber-50 p-3"><small className="font-bold uppercase tracking-wider text-amber-800">Nota del cliente</small><p className="mt-1 text-sm leading-5 text-amber-950">{selected.observaciones}</p></div>}
              </section>
              <section className={`min-w-44 rounded-2xl border p-5 shadow-sm ${stateStyles[selected.estado]}`}>
                <p className="text-[9px] font-bold uppercase tracking-[.18em]">ESTADO</p>
                <strong className="mt-2 block text-lg">{stateLabels[selected.estado]}</strong>
                <span className="mt-2 block text-xs opacity-70">Actualizá el avance del pedido.</span><select className="mt-4 w-full rounded-lg border border-current/20 bg-white/80 px-3 py-2.5 text-xs font-bold outline-none" value={selected.estado} disabled={update.isPending} onChange={(event) => update.mutate({ id: selected.id, next: event.target.value as OrderStatus })}>{states.map(state => <option key={state} value={state}>{stateLabels[state]}</option>)}</select>
              </section>
            </div>

            <section className="mx-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm sm:mx-6">
              <div className="flex items-end justify-between border-b border-neutral-200 bg-white p-5"><div><p className="eyebrow">02 · PRODUCTOS</p><h3 className="mt-1 font-serif text-2xl">Contenido del pedido</h3></div><div className="rounded-xl bg-neutral-100 px-4 py-2 text-right text-xs text-neutral-500"><strong className="block text-neutral-900">{selected.cantidad_unidades} unidades</strong>{selected.cantidad_productos_diferentes} productos diferentes</div></div>
              <div className="divide-y divide-neutral-200">
              {selected.items.map((item) => (
                <article className="grid gap-3 p-5 transition hover:bg-neutral-50 sm:grid-cols-[1fr_auto_auto] sm:items-center" key={item.id}>
                  <div className="min-w-0">
                    <strong>{item.producto_nombre}</strong>
                    <small className="mt-1 block text-neutral-500">Código Dux: {item.dux_codigo || "Sin código"} · Talle {item.talle ?? "histórico"}</small>
                  </div>
                  <div className="text-sm sm:text-right"><small className="block text-[9px] uppercase tracking-wider text-neutral-400">Cantidad × unitario</small><span>{item.cantidad} × {formatCurrency(Number(item.precio_unitario))}</span></div>
                  <div className="sm:min-w-28 sm:text-right"><small className="block text-[9px] uppercase tracking-wider text-neutral-400">Subtotal</small><strong>{formatCurrency(Number(item.subtotal))}</strong></div>
                </article>
              ))}
              </div>
            </section>

            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_340px]">
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3"><div><p className="eyebrow">INTEGRACIÓN</p><strong className="mt-1 block text-lg">Sincronización con Dux</strong></div><span className={`border px-3 py-1 text-[10px] font-bold uppercase ${selected.estado_sync_dux === 'enviado' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : selected.estado_sync_dux === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-neutral-300 bg-white text-neutral-600'}`}>{selected.estado_sync_dux}</span></div>
              {selected.estado_sync_dux === 'enviado' ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm"><strong className="text-emerald-800">✓ Pedido enviado correctamente</strong><p className="mt-1 text-neutral-600">Número en Dux: #{selected.dux_nro_pedido || selected.dux_id_pedido}</p>{selected.sincronizado_dux_en && <p className="mt-1 text-xs text-neutral-400">Sincronizado el {new Date(selected.sincronizado_dux_en).toLocaleString('es-AR')}</p>}</div>
              ) : <>
                <label className="mt-4 block text-xs font-bold">Vendedor asignado<select className="admin-filter mt-2 w-full" value={personal} onChange={(event) => setPersonal(Number(event.target.value))}>
                    <option value={1051689}>Romina Tiecher</option>
                    <option value={796900}>Julio</option>
                  </select></label>
                  <button className="mt-3 w-full rounded-xl bg-[#111111] px-4 py-3 text-xs font-bold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={sendDux.isPending || !duxWritingEnabled || selected.estado === 'cancelado'} onClick={() => sendDux.mutate({ id: selected.id, idPersonal: personal })}>
                    {selected.estado === 'cancelado' ? 'Pedido cancelado' : !duxWritingEnabled ? 'Bloqueado en desarrollo' : sendDux.isPending ? 'Enviando…' : selected.estado_sync_dux === 'error' ? 'Reintentar' : 'Enviar a Dux'}
                  </button>
                {!duxWritingEnabled && <p className="mt-2 text-xs text-amber-800">La escritura en Dux está deshabilitada por seguridad.</p>}
                {selected.error_sync_dux && <p className="mt-2 text-xs text-red-700">{selected.error_sync_dux}</p>}
                {sendDux.isError && <p className="mt-2 text-xs text-red-700">{sendDux.error.message}</p>}
              </>}
            </section>
            <section className="rounded-2xl bg-neutral-950 p-5 text-white shadow-sm"><p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/45">RESUMEN ECONÓMICO</p><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><span className="text-white/55">Subtotal</span><strong>{formatCurrency(Number(selected.subtotal_sin_descuento))}</strong></div><div className="flex justify-between gap-4 text-emerald-400"><span>Descuento</span><strong>− {formatCurrency(Number(selected.descuento_aplicado))}</strong></div><div className="flex items-end justify-between gap-4 border-t border-white/20 pt-4"><span className="font-bold">Total final</span><strong className="font-serif text-3xl">{formatCurrency(Number(selected.total))}</strong></div>{selected.aplica_precio_24_productos && <p className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-2 text-center text-[10px] font-bold uppercase text-emerald-300">Precio por cantidad aplicado</p>}</div></section>
            </div>

            {selected.estado !== 'cancelado' ? <section className="mx-5 mb-6 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 sm:mx-6 sm:flex-row sm:items-center sm:justify-between"><div><strong className="text-red-900">Zona de cancelación</strong><p className="mt-1 max-w-2xl text-xs text-red-700">Impide continuar procesándolo.{selected.dux_id_pedido ? ' Como ya existe en Dux, también deberá cancelarse allí.' : ''}</p></div><button className="shrink-0 rounded-xl bg-red-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-800 disabled:opacity-50" disabled={update.isPending} onClick={() => { if (window.confirm(`¿Confirmás la cancelación del pedido ${selected.codigo}?`)) update.mutate({ id: selected.id, next: 'cancelado' }, { onSuccess: () => { setSelectedId(null); setSearchParams({}) } }) }}>{update.isPending ? 'Cancelando…' : 'Cancelar pedido'}</button></section> : <section className="mx-5 mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-600 sm:mx-6">Este pedido está cancelado y no puede continuar procesándose.</section>}
          </aside>
        </div>
      )}
    </div>
  );
}
