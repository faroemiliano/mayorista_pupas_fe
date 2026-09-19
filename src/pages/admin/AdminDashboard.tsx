import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getAdminDashboard } from '../../api/admin'
import { apiAsset } from '../../api/client'
import { formatCurrency } from '../../utils/currency'

export function AdminDashboard() {
  const dashboard = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getAdminDashboard,
  })

  if (dashboard.isLoading) return <div className="admin-status"><span className="loader"/><p>Cargando panel…</p></div>
  if (dashboard.isError) return <div className="admin-status"><strong>No se pudo cargar el panel</strong><button onClick={() => dashboard.refetch()}>Reintentar</button></div>

  const data = dashboard.data!

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div><p className="eyebrow">TIENDA MAYORISTA</p><h1>Resumen general</h1><span>Estado actual del catálogo sincronizado con Dux.</span></div>
        <span className="sync-pill">● Dux conectado</span>
      </header>

      <section className="admin-metrics">
        <article><span>Productos activos</span><strong>{data.totalProducts}</strong><small>Publicados en la tienda</small></article>
        <article><span>Con stock</span><strong>{data.productsWithStock}</strong><small>Disponibles para comprar</small></article>
        <article className={data.productsWithoutStock ? 'attention' : ''}><span>Sin stock</span><strong>{data.productsWithoutStock}</strong><small>Requieren atención</small></article>
        <article><span>Organización</span><strong>{data.categories}</strong><small>{data.brands} marcas activas</small></article>
      </section>

      <section className="admin-panel-card">
        <div className="admin-card-header"><div><h2>Productos recientes</h2><p>Últimos artículos según la fecha informada por Dux.</p></div><Link to="/admin/productos">Ver todos →</Link></div>
        <div className="admin-product-list">
          {data.recentProducts.map((product) => (
            <article key={product.id}>
              <div className="admin-product-image">{product.imagen_url ? <img src={apiAsset(`/api/productos/${product.id}/imagen`)} alt=""/> : <span>◇</span>}</div>
              <div><strong>{product.nombre}</strong><small>{product.dux_codigo}</small></div>
              <span className={product.tiene_stock ? 'admin-stock-ok' : 'admin-stock-empty'}>{product.tiene_stock ? `${Number(product.stock_disponible)} unidades` : 'Sin stock'}</span>
              <strong>{product.precio_mayorista ? formatCurrency(Number(product.precio_mayorista)) : 'Sin precio'}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-coming-grid">
        <Link className="flex items-center gap-5 rounded-xl border border-gray-200 bg-white p-5 text-inherit no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" to="/admin/pedidos"><span className="grid size-12 shrink-0 place-items-center rounded-full bg-neutral-50 text-2xl text-[#111111]">▤</span><div className="grow"><span className="text-xs font-bold uppercase tracking-wider text-gray-500">Pedidos pendientes</span><strong className="mt-1 block text-3xl">{data.pendingOrders}</strong><p className="mt-1 text-sm text-gray-500">{data.pendingOrders===1?'Pedido esperando revisión':'Pedidos esperando revisión'}</p></div><span className="font-bold text-[#111111]">→</span></Link>
        <Link className="flex items-center gap-5 rounded-xl border border-gray-200 bg-white p-5 text-inherit no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" to="/admin/confirmaciones"><span className="grid size-12 shrink-0 place-items-center rounded-full bg-amber-50 text-2xl text-amber-700">✓</span><div className="grow"><span className="text-xs font-bold uppercase tracking-wider text-gray-500">Confirmaciones pendientes</span><strong className="mt-1 block text-3xl">{data.pendingConfirmations}</strong><p className="mt-1 text-sm text-gray-500">{data.pendingConfirmations===1?'Cliente esperando aprobación':'Clientes esperando aprobación'}</p></div><span className="font-bold text-[#111111]">→</span></Link>
      </section>
    </div>
  )
}
