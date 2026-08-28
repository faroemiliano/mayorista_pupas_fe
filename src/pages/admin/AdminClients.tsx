import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getDuxClients, getDuxClientSyncStatus, syncDuxClients } from '../../api/admin'


export function AdminClients() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const clients = useQuery({
    queryKey: ['admin-dux-clients', page, submittedSearch],
    queryFn: () => getDuxClients(page, submittedSearch),
  })
  const syncStatus = useQuery({
    queryKey: ['admin-dux-clients-sync-status'],
    queryFn: getDuxClientSyncStatus,
    refetchInterval: (query) => query.state.data?.estado === 'en_progreso' ? 2000 : false,
  })
  const sync = useMutation({
    mutationFn: syncDuxClients,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dux-clients-sync-status'] })
    },
  })
  const syncing = sync.isPending || syncStatus.data?.estado === 'en_progreso'
  useEffect(() => {
    if (syncStatus.data?.estado === 'completada') {
      setPage(1)
      queryClient.invalidateQueries({ queryKey: ['admin-dux-clients'] })
    }
  }, [syncStatus.data?.estado, syncStatus.data?.finalizada_en, queryClient])
  const lastSync = clients.data?.ultima_sincronizacion

  return <div className="admin-page">
    <header className="admin-page-header"><div><p className="eyebrow">CLIENTES DUX</p><h1>Clientes</h1><span>Datos comerciales sincronizados y su vinculación con las cuentas de la tienda.</span></div><button className="rounded-md bg-[#722f55] px-4 py-3 text-sm font-bold text-white disabled:opacity-50" disabled={syncing} onClick={() => sync.mutate()}>{syncing ? 'Sincronizando…' : '↻ Sincronizar clientes'}</button></header>
    {syncing && <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900"><strong>Sincronización en segundo plano.</strong> {syncStatus.data?.procesados ?? 0} clientes procesados. Podés seguir usando el panel.</div>}
    {sync.isError && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{sync.error instanceof Error ? sync.error.message : 'No se pudo completar la sincronización.'}</div>}
    {syncStatus.data?.estado === 'error' && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800"><strong>La sincronización no pudo completarse.</strong> {syncStatus.data.error || 'Reintentá nuevamente.'}</div>}
    {syncStatus.data?.estado === 'completada' && <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900"><strong>Última sincronización terminada.</strong> {syncStatus.data.total_local} clientes en total; {syncStatus.data.creados} nuevos y {syncStatus.data.actualizados} actualizados.</div>}
    <section className="admin-panel-card admin-table-card">
      <div className="admin-card-header"><div><h2>{clients.data?.total ?? 0} clientes en total</h2><p>{lastSync ? `Última sincronización: ${new Date(lastSync).toLocaleString('es-AR')}` : 'Todavía no se sincronizaron clientes.'}</p></div><form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); setPage(1); setSubmittedSearch(search.trim()) }}><input className="admin-filter" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre, email o documento…"/><button className="rounded-md bg-gray-100 px-3 text-sm font-bold" type="submit">Buscar</button></form></div>
      {clients.isLoading ? <div className="admin-status"><span className="loader"/><p>Cargando clientes…</p></div>
        : clients.isError ? <div className="admin-status"><strong>No se pudieron cargar los clientes</strong><button onClick={() => clients.refetch()}>Reintentar</button></div>
        : !clients.data?.items.length ? <div className="admin-status"><strong>{submittedSearch ? 'No se encontraron clientes' : 'Todavía no hay clientes sincronizados'}</strong>{!submittedSearch && <p>Presioná “Sincronizar clientes” para obtenerlos desde Dux.</p>}</div>
        : <div className="admin-table-wrap"><table><thead><tr><th>Cliente</th><th>Contacto</th><th>Documento</th><th>Ubicación</th><th>Cuenta web</th></tr></thead><tbody>{clients.data.items.map((client) => <tr key={client.id_cliente}>
          <td><strong>{client.nombre}</strong><small>Dux #{client.id_cliente}{client.codigo ? ` · ${client.codigo}` : ''}</small></td>
          <td>{client.email || 'No informado en Dux'}<small>{client.telefono || 'Sin teléfono'}</small></td>
          <td>{client.cuit_cuil || client.nro_doc || '—'}<small>{client.tipo_doc || ''}</small></td>
          <td>{client.localidad || '—'}<small>{client.provincia || ''}</small></td>
          <td>{client.usuario_id ? <><span className="admin-state active">Vinculada</span><small>Por {client.criterio_vinculacion === 'id_dux' ? 'ID Dux' : client.criterio_vinculacion}</small></> : <span className="admin-state">Sin cuenta web</span>}</td>
        </tr>)}</tbody></table></div>}
      <div className="pagination"><button disabled={page === 1 || clients.isFetching} onClick={() => setPage((value) => value - 1)}>← Anterior</button><span>Página {page}</span><button disabled={!clients.data?.hay_mas || clients.isFetching} onClick={() => setPage((value) => value + 1)}>Siguiente →</button></div>
    </section>
  </div>
}
