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
        <div><p className="eyebrow">PUPAS MAYORISTA</p><h1>Resumen general</h1><span>Estado actual del catálogo sincronizado con Dux.</span></div>
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
        <article><span>▤</span><div><strong>Pedidos</strong><p>La bandeja se habilitará cuando implementemos el registro de pedidos.</p></div></article>
        <article><span>♙</span><div><strong>Clientes</strong><p>Se conectará con autenticación, perfiles y permisos.</p></div></article>
      </section>
    </div>
  )
}
