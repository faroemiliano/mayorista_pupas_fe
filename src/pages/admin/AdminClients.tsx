import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDuxClients,
  getDuxClientSyncStatus,
  getDuxConfiguration,
  getClientPurchaseBalance,
  getWebClients,
  syncDuxClients,
} from "../../api/admin";
import { formatCurrency } from "../../utils/currency";
import type { AuthUser } from "../../types/auth";

function ClientPurchaseModal({ client, onClose }: { client: AuthUser; onClose: () => void }) {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [periodo, setPeriodo] = useState({ desde: "", hasta: "" });
  const balance = useQuery({
    queryKey: ["client-purchase-balance", client.id, periodo.desde, periodo.hasta],
    queryFn: () => getClientPurchaseBalance(client.id, periodo.desde, periodo.hasta),
  });
  const resumen = balance.data?.periodo ?? { pedidos: 0, unidades: 0, importe: 0 };
  const aplicarPeriodo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPeriodo({ desde, hasta });
  };
  const limpiarPeriodo = () => {
    setDesde("");
    setHasta("");
    setPeriodo({ desde: "", hasta: "" });
  };
  const cards = (titulo: string, datos: { pedidos: number; unidades: number; importe: number }) => <section><h3 className="text-sm font-bold">{titulo}</h3><div className="mt-3 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-neutral-100 p-4"><small className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Pedidos</small><strong className="mt-1 block text-2xl">{datos.pedidos}</strong></div><div className="rounded-xl bg-neutral-100 p-4"><small className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Productos</small><strong className="mt-1 block text-2xl">{datos.unidades}</strong></div><div className="rounded-xl bg-neutral-100 p-4"><small className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Gastado</small><strong className="mt-1 block text-2xl">{formatCurrency(datos.importe)}</strong></div></div></section>;
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"><header className="flex items-start justify-between border-b border-neutral-200 p-6"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-neutral-400">HISTORIAL DE COMPRAS</p><h2 className="mt-1 text-2xl font-bold">{client.nombre} {client.apellido}</h2><p className="mt-1 text-sm text-neutral-500">{client.email}</p></div><button type="button" className="grid size-9 place-items-center rounded-full bg-neutral-100 text-2xl" onClick={onClose}>×</button></header><div className="space-y-6 p-6">{balance.isLoading ? <div className="admin-status"><span className="loader"/><p>Cargando balance…</p></div> : balance.isError ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800">No se pudo cargar el balance. <button className="font-bold underline" onClick={() => balance.refetch()}>Reintentar</button></div> : balance.data && <>{cards("Balance acumulado", balance.data.acumulado)}<form className="rounded-xl border border-neutral-200 p-4" onSubmit={aplicarPeriodo}><div className="flex flex-wrap items-end gap-3"><label className="text-xs font-bold">Desde<input className="mt-1 block rounded-lg border border-neutral-300 px-3 py-2 text-sm" type="date" value={desde} max={hasta || undefined} onChange={(event) => setDesde(event.target.value)}/></label><label className="text-xs font-bold">Hasta<input className="mt-1 block rounded-lg border border-neutral-300 px-3 py-2 text-sm" type="date" value={hasta} min={desde || undefined} onChange={(event) => setHasta(event.target.value)}/></label><button className="rounded-lg bg-black px-4 py-2 text-xs font-bold text-white">Ver período</button>{(periodo.desde || periodo.hasta) && <button type="button" className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-bold" onClick={limpiarPeriodo}>Ver todo</button>}</div></form>{cards(periodo.desde || periodo.hasta ? "Compras en el período elegido" : "Compras en todo el historial", resumen)}<p className="text-xs leading-5 text-neutral-500">{balance.data.alcance}</p></>}</div></div></div>;
}

export function AdminClients() {
  const queryClient = useQueryClient();
  const duxConfiguration = useQuery({
    queryKey: ["dux-configuration"],
    queryFn: getDuxConfiguration,
  });
  const duxSyncEnabled =
    duxConfiguration.data?.sincronizacion_habilitada === true;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [passwordFilter, setPasswordFilter] = useState<
    "todos" | "pendiente" | "creada"
  >("pendiente");
  const [view, setView] = useState<"web" | "dux">("web");
  const [selectedClient, setSelectedClient] = useState<AuthUser | null>(null);
  const clients = useQuery({
    queryKey: ["admin-dux-clients", page, submittedSearch],
    queryFn: () => getDuxClients(page, submittedSearch),
  });
  const syncStatus = useQuery({
    queryKey: ["admin-dux-clients-sync-status"],
    queryFn: getDuxClientSyncStatus,
    refetchInterval: (query) =>
      query.state.data?.estado === "en_progreso" ? 2000 : false,
  });
  const webClients = useQuery({
    queryKey: ["admin-web-clients", page, submittedSearch, passwordFilter],
    queryFn: () => getWebClients(page, submittedSearch, passwordFilter),
  });
  const sync = useMutation({
    mutationFn: syncDuxClients,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-dux-clients-sync-status"],
      });
    },
  });
  const syncing = sync.isPending || syncStatus.data?.estado === "en_progreso";
  useEffect(() => {
    if (syncStatus.data?.estado === "completada") {
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ["admin-dux-clients"] });
    }
  }, [syncStatus.data?.estado, syncStatus.data?.finalizada_en, queryClient]);
  const lastSync = clients.data?.ultima_sincronizacion;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">GESTIÓN DE CLIENTES</p>
          <h1>Clientes</h1>
          <span>
            Cuentas migradas desde WordPress y registradas en la nueva página.
          </span>
        </div>
        <button
          className="rounded-md bg-[#111111] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
          disabled={syncing || !duxSyncEnabled}
          onClick={() => sync.mutate()}
        >
          {!duxSyncEnabled
            ? "Dux pausado"
            : syncing
              ? "Sincronizando…"
              : "↻ Sincronizar Dux"}
        </button>
      </header>
      {syncing && (
        <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Sincronización en segundo plano.</strong>{" "}
          {syncStatus.data?.procesados ?? 0} clientes procesados. Podés seguir
          usando el panel.
        </div>
      )}
      {sync.isError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          {sync.error instanceof Error
            ? sync.error.message
            : "No se pudo completar la sincronización."}
        </div>
      )}
      {syncStatus.data?.estado === "error" && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <strong>La sincronización no pudo completarse.</strong>{" "}
          {syncStatus.data.error || "Reintentá nuevamente."}
        </div>
      )}
      {syncStatus.data?.estado === "completada" && (
        <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
          <strong>Última sincronización terminada.</strong>{" "}
          {syncStatus.data.total_local} clientes en total;{" "}
          {syncStatus.data.creados} nuevos y {syncStatus.data.actualizados}{" "}
          actualizados.
        </div>
      )}
      <section className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setView("web");
            setPage(1);
          }}
          className={`border p-5 text-left ${view === "web" ? "border-black bg-black text-white" : "border-neutral-200 bg-white"}`}
        >
          <small className="text-[9px] font-bold uppercase tracking-[.18em] opacity-60">
            Registrados en la página
          </small>
          <strong className="mt-2 block text-3xl">
            {webClients.data?.total ?? 0}
          </strong>
          <span className="mt-1 block text-xs opacity-70">
            Cuentas con el filtro actual
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setView("dux");
            setPage(1);
          }}
          className={`border p-5 text-left ${view === "dux" ? "border-black bg-black text-white" : "border-neutral-200 bg-white"}`}
        >
          <small className="text-[9px] font-bold uppercase tracking-[.18em] opacity-60">
            Base comercial Dux
          </small>
          <strong className="mt-2 block text-3xl">
            {clients.data?.total ?? 0}
          </strong>
          <span className="mt-1 block text-xs opacity-70">
            Clientes obtenidos en la sincronización
          </span>
        </button>
      </section>
      <section className="admin-panel-card admin-table-card">
        <div className="admin-card-header">
          <div>
            <h2>
              {view === "web"
                ? `${webClients.data?.total ?? 0} clientes registrados`
                : `${clients.data?.total ?? 0} clientes Dux`}
            </h2>
            <p>
              {view === "web"
                ? "Carga paginada para trabajar sin descargar toda la base."
                : lastSync
                  ? `Última sincronización: ${new Date(lastSync).toLocaleString("es-AR")}`
                  : "Todavía no se sincronizaron clientes."}
            </p>
          </div>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSubmittedSearch(search.trim());
            }}
          >
            <input
              className="admin-filter"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nombre, email o documento…"
            />
            <button
              className="rounded-md bg-gray-100 px-3 text-sm font-bold"
              type="submit"
            >
              Buscar
            </button>
          </form>
        </div>
        {view === "web" && (
          <div className="flex flex-wrap gap-2 border-b border-neutral-200 bg-neutral-50 p-4">
            <span className="self-center text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Cambio de clave
            </span>
            {(
              [
                ["pendiente", "Pendiente"],
                ["creada", "Clave creada"],
                ["todos", "Todos"],
              ] as const
            ).map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={`rounded-full px-3 py-2 text-xs font-bold ${passwordFilter === value ? "bg-black text-white" : "bg-white text-neutral-600 border border-neutral-200"}`}
                onClick={() => {
                  setPasswordFilter(value);
                  setPage(1);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {view === "web" ? (
          <>
            {webClients.isLoading ? (
              <div className="admin-status">
                <span className="loader" />
                <p>Cargando clientes registrados…</p>
              </div>
            ) : webClients.isError ? (
              <div className="admin-status">
                <strong>No se pudieron cargar las cuentas web</strong>
                <button onClick={() => webClients.refetch()}>Reintentar</button>
              </div>
            ) : !webClients.data?.items.length ? (
              <div className="admin-status">
                <strong>
                  {submittedSearch
                    ? "No se encontraron clientes"
                    : "No hay clientes para este filtro"}
                </strong>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Contacto</th>
                      <th>Ubicación</th>
                      <th>Canal de venta</th>
                      <th>Estado</th>
                      <th>Cambio de clave</th>
                      <th>Dux</th>
                    </tr>
                  </thead>
                  <tbody>
                    {webClients.data.items.map((client) => (
                      <tr key={client.id} className="cursor-pointer transition hover:bg-neutral-50" onClick={() => setSelectedClient(client)}>
                        <td>
                          <strong>
                            {client.nombre} {client.apellido}
                          </strong>
                          <small>
                            Cuenta web #{client.id} ·{" "}
                            {new Date(client.creado_en).toLocaleDateString(
                              "es-AR",
                            )}
                          </small>
                        </td>
                        <td>
                          {client.email}
                          <small>{client.telefono || "Sin teléfono"}</small>
                        </td>
                        <td>
                          {client.localidad_partido || "—"}
                          <small>{client.provincia || ""}</small>
                        </td>
                        <td>
                          {client.canal_venta === "ambos"
                            ? "Local y tienda online"
                            : client.canal_venta === "tienda_online"
                              ? "Tienda online"
                              : client.canal_venta === "local_fisico"
                                ? "Local físico"
                                : "—"}
                          {client.tienda_online_url && (
                            <small>{client.tienda_online_url}</small>
                          )}
                        </td>
                        <td>
                          <span
                            className={`admin-state ${client.estado_registro === "aprobado" ? "active" : ""}`}
                          >
                            {client.estado_registro}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`admin-state ${client.requiere_migracion_password ? "" : "active"}`}
                          >
                            {client.requiere_migracion_password
                              ? "Pendiente"
                              : "Clave creada"}
                          </span>
                        </td>
                        <td>
                          {client.dux_id_cliente ? (
                            <>
                              <span className="admin-state active">
                                Vinculado
                              </span>
                              <small>Dux #{client.dux_id_cliente}</small>
                            </>
                          ) : (
                            <span className="admin-state">
                              Pendiente de vincular
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {webClients.data && webClients.data.total_paginas > 1 && (
              <nav className="pagination">
                <button
                  disabled={page === 1 || webClients.isFetching}
                  onClick={() => setPage((current) => current - 1)}
                >
                  ← Anterior
                </button>
                <span>
                  Página {page} de {webClients.data.total_paginas}
                </span>
                <button
                  disabled={
                    page >= webClients.data.total_paginas ||
                    webClients.isFetching
                  }
                  onClick={() => setPage((current) => current + 1)}
                >
                  Siguiente →
                </button>
              </nav>
            )}
          </>
        ) : (
          <>
            {clients.isLoading ? (
              <div className="admin-status">
                <span className="loader" />
                <p>Cargando clientes…</p>
              </div>
            ) : clients.isError ? (
              <div className="admin-status">
                <strong>No se pudieron cargar los clientes</strong>
                <button onClick={() => clients.refetch()}>Reintentar</button>
              </div>
            ) : !clients.data?.items.length ? (
              <div className="admin-status">
                <strong>
                  {submittedSearch
                    ? "No se encontraron clientes"
                    : "Todavía no hay clientes sincronizados"}
                </strong>
                {!submittedSearch && (
                  <p>
                    Presioná “Sincronizar clientes” para obtenerlos desde Dux.
                  </p>
                )}
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Contacto</th>
                      <th>Documento</th>
                      <th>Ubicación</th>
                      <th>Cuenta web</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.data.items.map((client) => (
                      <tr key={client.id_cliente}>
                        <td>
                          <strong>{client.nombre}</strong>
                          <small>
                            Dux #{client.id_cliente}
                            {client.codigo ? ` · ${client.codigo}` : ""}
                          </small>
                        </td>
                        <td>
                          {client.email || "No informado en Dux"}
                          <small>{client.telefono || "Sin teléfono"}</small>
                        </td>
                        <td>
                          {client.cuit_cuil || client.nro_doc || "—"}
                          <small>{client.tipo_doc || ""}</small>
                        </td>
                        <td>
                          {client.localidad || "—"}
                          <small>{client.provincia || ""}</small>
                        </td>
                        <td>
                          {client.usuario_id ? (
                            <>
                              <span className="admin-state active">
                                Vinculada
                              </span>
                              <small>
                                Por{" "}
                                {client.criterio_vinculacion === "id_dux"
                                  ? "ID Dux"
                                  : client.criterio_vinculacion}
                              </small>
                            </>
                          ) : (
                            <span className="admin-state">Sin cuenta web</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="pagination">
              <button
                disabled={page === 1 || clients.isFetching}
                onClick={() => setPage((value) => value - 1)}
              >
                ← Anterior
              </button>
              <span>Página {page}</span>
              <button
                disabled={!clients.data?.hay_mas || clients.isFetching}
                onClick={() => setPage((value) => value + 1)}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </section>
      {selectedClient && <ClientPurchaseModal client={selectedClient} onClose={() => setSelectedClient(null)} />}
    </div>
  );
}
