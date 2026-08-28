import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getProductAnalytics } from '../../api/admin'
import type { ProductSalesRanking } from '../../types/admin'
import { formatCurrency } from '../../utils/currency'

function RankingTable({ title, description, items }: { title: string; description: string; items: ProductSalesRanking[] }) {
  return <section className="admin-panel-card admin-table-card analytics-table">
    <div className="admin-card-header"><div><h2>{title}</h2><p>{description}</p></div></div>
    {items.length === 0
      ? <div className="analytics-empty">No hay información para este período.</div>
      : <div className="admin-table-wrap"><table><thead><tr><th>Producto</th><th>Unidades</th><th>Pedidos</th><th>Importe</th><th>Stock actual</th></tr></thead><tbody>{items.map((item, index) => <tr key={item.producto_id}><td><strong>{index + 1}. {item.nombre}</strong><small>{item.dux_codigo}</small></td><td><strong>{item.unidades_vendidas}</strong></td><td>{item.cantidad_pedidos}</td><td>{formatCurrency(Number(item.importe_vendido))}</td><td>{Number(item.stock_disponible)}</td></tr>)}</tbody></table></div>}
  </section>
}

export function AdminProductAnalytics() {
  const [days, setDays] = useState<number | null>(30)
  const analytics = useQuery({
    queryKey: ['admin-product-analytics', days],
    queryFn: () => getProductAnalytics(days),
  })
  const data = analytics.data

  return <div className="admin-page">
    <header className="admin-page-header"><div><p className="eyebrow">RENDIMIENTO DE PRODUCTOS</p><h1>Analítica de ventas</h1><span>Rotación, facturación y stock actual por producto.</span></div><select className="admin-filter" value={days ?? 'all'} onChange={(event) => setDays(event.target.value === 'all' ? null : Number(event.target.value))}><option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option><option value="90">Últimos 90 días</option><option value="365">Último año</option><option value="all">Todo el historial</option></select></header>
    {analytics.isLoading ? <div className="admin-status"><span className="loader"/><p>Calculando ventas…</p></div>
      : analytics.isError || !data ? <div className="admin-status"><strong>No se pudo cargar la analítica</strong><button onClick={() => analytics.refetch()}>Reintentar</button></div>
      : <>
        <div className="analytics-scope"><strong>Origen actual: pedidos de la tienda</strong><span>{data.alcance}</span></div>
        <section className="admin-metrics">
          <article><span>UNIDADES VENDIDAS</span><strong>{data.resumen.unidades_vendidas}</strong><small>Sin pedidos cancelados</small></article>
          <article><span>IMPORTE VENDIDO</span><strong>{formatCurrency(Number(data.resumen.importe_vendido))}</strong><small>Total confirmado en la web</small></article>
          <article><span>PRODUCTOS CON VENTAS</span><strong>{data.resumen.productos_con_ventas}</strong><small>Con movimiento en el período</small></article>
          <article className="attention"><span>SIN VENTAS</span><strong>{data.resumen.productos_sin_ventas}</strong><small>Productos habilitados sin rotación</small></article>
        </section>
        <div className="analytics-grid"><RankingTable title="Más vendidos" description="Ordenados por cantidad de unidades." items={data.mas_vendidos}/><RankingTable title="Menor rotación" description="Productos vendidos con menos unidades." items={data.menos_vendidos}/></div>
        <div className="analytics-last"><RankingTable title="Productos sin ventas" description="Habilitados en Dux que no registraron ventas en el período." items={data.sin_ventas}/></div>
      </>}
  </div>
}
