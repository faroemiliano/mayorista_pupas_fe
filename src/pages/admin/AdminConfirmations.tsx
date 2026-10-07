import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "../../api/client";
import type { AuthUser } from "../../types/auth";

type StatusFilter = "todos" | "pendiente" | "aprobado" | "rechazado";
const labels = {
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
};
const channelLabels: Record<string, string> = {
  local_fisico: "Local físico",
  tienda_online: "Tienda online",
  ambos: "Local físico + online",
};
type UsersPage = {
  items: AuthUser[];
  total: number;
  page: number;
  limit: number;
  total_paginas: number;
  totales_estado: Record<Exclude<StatusFilter, "todos">, number>;
};

export function AdminConfirmations() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>("pendiente");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const users = useQuery({
    queryKey: ["admin-users-page", filter, page, submittedSearch],
    queryFn: () =>
      apiGet<UsersPage>(
        `/api/admin/usuarios/paginados?${new URLSearchParams({ page: String(page), limit: "25", ...(filter === "todos" ? {} : { estado: filter }), ...(submittedSearch ? { buscar: submittedSearch } : {}) })}`,
      ),
  });
  const update = useMutation({
    mutationFn: ({
      id,
      estado,
    }: {
      id: number;
      estado: "aprobado" | "rechazado";
    }) => apiPatch<AuthUser>(`/api/admin/usuarios/${id}/estado`, { estado }),
    onSuccess: (updated) =>
      queryClient.setQueryData<UsersPage>(
        ["admin-users-page", filter, page, submittedSearch],
        (current) => {
          if (!current) return current;
          const previous = current.items.find((user) => user.id === updated.id);
          if (!previous) return current;
          const totals = { ...current.totales_estado };
          if (previous.estado_registro !== updated.estado_registro) {
            totals[previous.estado_registro] = Math.max(
              0,
              totals[previous.estado_registro] - 1,
            );
            totals[updated.estado_registro] += 1;
          }
          const leavesCurrentFilter =
            filter !== "todos" && updated.estado_registro !== filter;
          return {
            ...current,
            total: leavesCurrentFilter
              ? Math.max(0, current.total - 1)
              : current.total,
            items: leavesCurrentFilter
              ? current.items.filter((user) => user.id !== updated.id)
              : current.items.map((user) =>
                  user.id === updated.id ? updated : user,
                ),
            totales_estado: totals,
          };
        },
      ),
  });
  const visible = users.data?.items ?? [];
  const counts = users.data?.totales_estado ?? {
    pendiente: 0,
    aprobado: 0,
    rechazado: 0,
  };
  const totalClients = counts.pendiente + counts.aprobado + counts.rechazado;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">GESTIÓN DE ACCESOS</p>
          <h1>Confirmaciones</h1>
          <span>Historial completo de solicitudes mayoristas y su estado.</span>
        </div>
      </header>
      <section className="admin-panel-card">
        <div className="admin-card-header">
          <div>
            <h2>{totalClients} clientes registrados</h2>
            <p>
              {counts.pendiente} pendientes · {counts.aprobado} aprobados ·{" "}
              {counts.rechazado} rechazados
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-4">
          {(
            ["pendiente", "aprobado", "rechazado", "todos"] as StatusFilter[]
          ).map((status) => (
            <button
              key={status}
              className={`rounded-full px-4 py-2 text-xs font-bold ${filter === status ? "bg-[#111111] text-white" : "bg-gray-100 text-gray-600"}`}
              onClick={() => {
                setFilter(status);
                setPage(1);
              }}
            >
              {status === "todos"
                ? `Todos (${totalClients})`
                : `${labels[status]} (${counts[status]})`}
            </button>
          ))}
        </div>
        <form className="flex gap-2 border-b border-gray-100 p-4" onSubmit={(event) => { event.preventDefault(); setSubmittedSearch(search.trim()); setPage(1); }}>
          <input className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, apellido, email o teléfono" />
          <button className="rounded-lg bg-black px-4 py-2 text-xs font-bold text-white">Buscar</button>
          {submittedSearch && <button type="button" className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold" onClick={() => { setSearch(""); setSubmittedSearch(""); setPage(1); }}>Limpiar</button>}
        </form>
        {users.isLoading ? (
          <div className="admin-status">
            <span className="loader" />
          </div>
        ) : !visible.length ? (
          <div className="admin-status">
            <strong>{submittedSearch ? "No encontramos clientes con esa búsqueda" : "No hay clientes en este estado"}</strong>
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
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>
                        {[user.nombre, user.apellido].filter(Boolean).join(" ")}
                      </strong>
                      {!user.apellido?.trim() && (
                        <small className="font-bold text-amber-700">
                          Falta apellido
                        </small>
                      )}
                      <small>Cuenta web #{user.id}</small>
                    </td>
                    <td>
                      {user.email}
                      <small>{user.telefono || "Sin teléfono"}</small>
                    </td>
                    <td>
                      {user.localidad_partido || "No informado"}
                      <small>{user.provincia || "Sin provincia"}</small>
                    </td>
                    <td>
                      {channelLabels[user.canal_venta || ""] || "No informado"}
                      {user.tienda_online_url && (
                        <a
                          className="block text-xs text-[#111111]"
                          href={user.tienda_online_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver tienda ↗
                        </a>
                      )}
                    </td>
                    <td>
                      {new Date(user.creado_en).toLocaleDateString("es-AR")}
                    </td>
                    <td>
                      <span
                        className={`admin-state ${user.estado_registro === "aprobado" ? "active" : ""}`}
                      >
                        {labels[user.estado_registro]}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {user.estado_registro !== "aprobado" && (
                          <button
                            className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                            disabled={update.isPending}
                            onClick={() =>
                              update.mutate({ id: user.id, estado: "aprobado" })
                            }
                          >
                            Aprobar
                          </button>
                        )}
                        {user.estado_registro !== "rechazado" && (
                          <button
                            className="rounded-md bg-neutral-200 px-3 py-2 text-xs font-bold text-neutral-800 disabled:opacity-50"
                            disabled={update.isPending}
                            onClick={() =>
                              update.mutate({
                                id: user.id,
                                estado: "rechazado",
                              })
                            }
                          >
                            Rechazar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {users.data && users.data.total_paginas > 1 && (
          <nav className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
            >
              ← Anterior
            </button>
            <span>
              Página {page} de {users.data.total_paginas}
            </span>
            <button
              disabled={page >= users.data.total_paginas}
              onClick={() => setPage((current) => current + 1)}
            >
              Siguiente →
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
