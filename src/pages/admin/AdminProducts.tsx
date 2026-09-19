import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getAdminProducts, getDuxCatalogSyncStatus, setProductVisibility, syncDuxCatalog } from '../../api/admin'
import { formatCurrency } from '../../utils/currency'

export function AdminProducts() {
  const [page, setPage] = useState(1)
  const [search,setSearch]=useState('')
  const [submittedSearch,setSubmittedSearch]=useState('')
  const queryClient = useQueryClient()
  const products = useQuery({
    queryKey: ['admin-products', page, submittedSearch],
    queryFn: () => getAdminProducts(page,submittedSearch),
    placeholderData: (previous) => previous,
  })
  const syncStatus = useQuery({
    queryKey: ['dux-catalog-sync'],
    queryFn: getDuxCatalogSyncStatus,
    refetchInterval: (query) => query.state.data?.estado === 'en_progreso' ? 2000 : false,
  })
  const sync = useMutation({
    mutationFn: syncDuxCatalog,
    onSuccess: (status) => {
      queryClient.setQueryData(['dux-catalog-sync'], status)
    },
  })
  const syncing = sync.isPending || syncStatus.data?.estado === 'en_progreso'
  const visibility=useMutation({mutationFn:({id,visible}:{id:number;visible:boolean})=>setProductVisibility(id,visible),onSuccess:()=>{queryClient.invalidateQueries({queryKey:['admin-products']});queryClient.invalidateQueries({queryKey:['products']})}})
  const lastSync = syncStatus.data?.finalizada_en

  useEffect(() => {
    if (syncStatus.data?.estado !== 'completada') return
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['catalog-filters'] })
  }, [lastSync, queryClient, syncStatus.data?.estado])

  return <div className="admin-page">
    <header className="admin-page-header"><div><p className="eyebrow">CATÁLOGO DUX</p><h1>Productos</h1><span>Consulta de precios, disponibilidad y estado de publicación.</span></div><button className="rounded-md bg-[#111111] px-4 py-2.5 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50" disabled={syncing} onClick={()=>sync.mutate()}>{syncing?'Sincronizando…':'↻ Sincronizar con Dux'}</button></header>
    <div className={`rounded-md border p-3 text-sm ${syncStatus.data?.estado==='error'||sync.isError?'border-red-200 bg-red-50 text-red-800':'border-blue-100 bg-blue-50 text-blue-900'}`}>
      {syncStatus.data?.estado==='en_progreso'&&<span>Actualizando productos, precios y stock desde Dux. Podés continuar usando el panel.</span>}
      {syncStatus.data?.estado==='completada'&&<span>Última sincronización completada: {lastSync?new Date(lastSync).toLocaleString('es-AR'):'—'} · {syncStatus.data.procesados} productos procesados.</span>}
      {syncStatus.data?.estado==='error'&&<span>Error en la última sincronización: {syncStatus.data.error}</span>}
      {(!syncStatus.data||syncStatus.data.estado==='pendiente')&&!sync.isError&&<span>Sincronizá para traer los últimos productos, precios y existencias disponibles.</span>}
      {sync.isError&&<span>No se pudo iniciar la sincronización: {sync.error.message}</span>}
    </div>
    <section className="admin-panel-card admin-table-card">
      <div className="admin-card-header"><div><h2>{products.data?.total ?? 0} productos</h2><p>{submittedSearch?`Resultados para “${submittedSearch}”`:'Los cambios se administran desde Dux y luego se sincronizan.'}</p></div><form className="flex w-full max-w-md gap-2" onSubmit={event=>{event.preventDefault();setPage(1);setSubmittedSearch(search.trim())}}><input className="admin-filter min-w-0 grow" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Buscar por nombre o código…"/><button className="rounded-md bg-[#111111] px-4 text-sm font-bold text-white" type="submit">Buscar</button>{submittedSearch&&<button className="rounded-md bg-gray-100 px-3 text-sm font-bold" type="button" onClick={()=>{setSearch('');setSubmittedSearch('');setPage(1)}}>Limpiar</button>}</form></div>
      {visibility.isError&&<p className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{visibility.error.message}</p>}
      {products.isLoading ? <div className="admin-status"><span className="loader"/></div> : !products.data?.items.length?<div className="admin-status"><strong>No encontramos productos</strong><p>Probá con otro nombre o código.</p></div>:<div className="admin-table-wrap"><table><thead><tr><th>Producto</th><th>Código Dux</th><th>Estado Dux</th><th>En la tienda</th><th>Stock</th><th>Mayorista</th><th>24 productos</th></tr></thead><tbody>{products.data.items.map((product) => <tr key={product.id}><td><strong>{product.nombre}</strong><small>{product.marca?.nombre || 'Sin marca'}</small></td><td>{product.dux_codigo}</td><td><span className={product.habilitado ? 'admin-state active' : 'admin-state'}>{product.habilitado ? 'Habilitado' : 'Deshabilitado'}</span></td><td><div className="flex items-center gap-2"><span className={product.visible_tienda?'admin-state active':'admin-state'}>{product.visible_tienda?'Visible':'Oculto'}</span><button className={`rounded-md px-3 py-1.5 text-xs font-bold ${product.visible_tienda?'bg-neutral-200 text-neutral-800':'bg-emerald-100 text-emerald-800'}`} disabled={visibility.isPending} onClick={()=>visibility.mutate({id:product.id,visible:!product.visible_tienda})}>{product.visible_tienda?'Ocultar':'Mostrar'}</button></div></td><td>{Number(product.stock_disponible)}</td><td>{product.precio_mayorista ? formatCurrency(Number(product.precio_mayorista)) : '—'}</td><td>{product.precio_24_productos ? formatCurrency(Number(product.precio_24_productos)) : '—'}</td></tr>)}</tbody></table></div>}
      {products.data && products.data.total_paginas > 1 && <nav className="pagination"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>← Anterior</button><span>Página {page} de {products.data.total_paginas}</span><button disabled={page >= products.data.total_paginas} onClick={() => setPage((value) => value + 1)}>Siguiente →</button></nav>}
    </section>
  </div>
}
