import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getProductAnalytics } from '../../api/admin'
import type { ProductAnalytics, ProductSalesRanking } from '../../types/admin'
import { formatCurrency } from '../../utils/currency'

function RankingTable({ title, description, items }: { title: string; description: string; items: ProductSalesRanking[] }) {
  return <section className="admin-panel-card admin-table-card analytics-table">
    <div className="admin-card-header"><div><h2>{title}</h2><p>{description}</p></div></div>
    {items.length === 0
      ? <div className="analytics-empty">No hay información para este período.</div>
      : <div className="admin-table-wrap"><table><thead><tr><th>Producto</th><th>Unidades</th><th>Pedidos</th><th>Importe</th><th>Stock actual</th></tr></thead><tbody>{items.map((item, index) => <tr key={item.producto_id}><td><strong>{index + 1}. {item.nombre}</strong><small>{item.dux_codigo}</small></td><td><strong>{item.unidades_vendidas}</strong></td><td>{item.cantidad_pedidos}</td><td>{formatCurrency(Number(item.importe_vendido))}</td><td>{Number(item.stock_disponible)}</td></tr>)}</tbody></table></div>}
  </section>
}

type Metric = 'importe' | 'unidades' | 'pedidos'

function SalesLineChart({ points }: { points: ProductAnalytics['serie_ventas'] }) {
  const [metric, setMetric] = useState<Metric>('importe')
  const [selected, setSelected] = useState(Math.max(points.length - 1, 0))
  useEffect(() => setSelected(Math.max(points.length - 1, 0)), [points])
  const values = points.map(point => metric === 'importe' ? Number(point.importe) : point[metric])
  const maximum = Math.max(...values, 1)
  const width = 900
  const height = 280
  const left = 62
  const right = 18
  const top = 20
  const bottom = 42
  const chartWidth = width - left - right
  const chartHeight = height - top - bottom
  const x = (index: number) => left + (points.length <= 1 ? chartWidth / 2 : index * chartWidth / (points.length - 1))
  const y = (value: number) => top + chartHeight - (value / maximum) * chartHeight
  const path = points.map((_, index) => `${x(index)},${y(values[index])}`).join(' ')
  const active = points[selected]
  const formatValue = (value: number) => metric === 'importe' ? formatCurrency(value) : value.toLocaleString('es-AR')
  const labelIndexes = new Set(Array.from({ length: Math.min(6, points.length) }, (_, index) => Math.round(index * (points.length - 1) / Math.max(Math.min(6, points.length) - 1, 1))))

  return <section className="admin-panel-card overflow-hidden">
    <div className="admin-card-header flex-wrap gap-4"><div><h2>Evolución de ventas</h2><p>Seleccioná una variable y tocá cualquier punto para ver su detalle.</p></div><div className="flex border border-neutral-300 bg-white p-1">{(['importe', 'unidades', 'pedidos'] as Metric[]).map(item => <button key={item} type="button" onClick={() => setMetric(item)} className={`px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider ${metric === item ? 'bg-black text-white' : 'text-neutral-500'}`}>{item === 'importe' ? 'Facturación' : item}</button>)}</div></div>
    {!points.length ? <div className="analytics-empty">No hay datos para graficar.</div> : <>
      <div className="grid gap-0 border-b border-neutral-200 bg-neutral-50 sm:grid-cols-4">
        <div className="border-b border-neutral-200 p-4 sm:border-b-0 sm:border-r"><small className="block text-[9px] font-bold uppercase tracking-wider text-neutral-500">Intervalo</small><strong className="mt-1 block">{active?.etiqueta}</strong></div>
        <div className="border-b border-neutral-200 p-4 sm:border-b-0 sm:border-r"><small className="block text-[9px] font-bold uppercase tracking-wider text-neutral-500">Facturación</small><strong className="mt-1 block">{formatCurrency(Number(active?.importe || 0))}</strong></div>
        <div className="border-b border-neutral-200 p-4 sm:border-b-0 sm:border-r"><small className="block text-[9px] font-bold uppercase tracking-wider text-neutral-500">Movimiento</small><strong className="mt-1 block">{active?.unidades || 0} unidades · {active?.pedidos || 0} pedidos</strong></div>
        <div className="p-4"><small className="block text-[9px] font-bold uppercase tracking-wider text-neutral-500">Variación</small><strong className={`mt-1 block ${(active?.variacion_porcentual || 0) > 0 ? 'text-emerald-700' : (active?.variacion_porcentual || 0) < 0 ? 'text-red-700' : ''}`}>{active?.variacion_porcentual == null ? 'Sin comparación' : `${active.variacion_porcentual > 0 ? '+' : ''}${active.variacion_porcentual}%`}</strong></div>
      </div>
      <div className="overflow-x-auto p-4 sm:p-6"><svg className="min-w-[680px]" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Gráfico de ${metric} por período`}>
        {[0, .25, .5, .75, 1].map(ratio => <g key={ratio}><line x1={left} x2={width-right} y1={top + chartHeight * ratio} y2={top + chartHeight * ratio} stroke="#e5e5e5"/><text x={left-10} y={top + chartHeight * ratio + 4} textAnchor="end" fontSize="10" fill="#737373">{formatValue(maximum * (1-ratio))}</text></g>)}
        <polyline points={path} fill="none" stroke="#111" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
        {points.map((point, index) => <g key={point.clave} onMouseEnter={() => setSelected(index)} onClick={() => setSelected(index)} className="cursor-pointer"><circle cx={x(index)} cy={y(values[index])} r="10" fill="transparent"/><circle cx={x(index)} cy={y(values[index])} r={selected === index ? 6 : 3} fill={selected === index ? '#111' : '#fff'} stroke="#111" strokeWidth="2"/></g>)}
        {labelIndexes.size > 0 && points.map((point, index) => labelIndexes.has(index) ? <text key={point.clave} x={x(index)} y={height-12} textAnchor="middle" fontSize="10" fill="#737373">{point.etiqueta}</text> : null)}
      </svg></div>
    </>}
  </section>
}

export function AdminProductAnalytics() {
  const [days, setDays] = useState<number | null>(30)
  const [grouping, setGrouping] = useState<'dia' | 'semana' | 'mes' | 'anio'>('dia')
  const analytics = useQuery({
    queryKey: ['admin-product-analytics', days, grouping],
    queryFn: () => getProductAnalytics(days, grouping),
  })
  const data = analytics.data

  return <div className="admin-page">
    <header className="admin-page-header"><div><p className="eyebrow">RENDIMIENTO DE PRODUCTOS</p><h1>Analítica de ventas</h1><span>Evolución, facturación, pedidos y rotación por producto.</span></div><div className="flex flex-wrap gap-2"><select aria-label="Período analizado" className="admin-filter" value={days ?? 'all'} onChange={(event) => setDays(event.target.value === 'all' ? null : Number(event.target.value))}><option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option><option value="90">Últimos 90 días</option><option value="365">Último año</option><option value="all">Todo el historial</option></select><select aria-label="Agrupación del gráfico" className="admin-filter" value={grouping} onChange={event => setGrouping(event.target.value as typeof grouping)}><option value="dia">Separar por días</option><option value="semana">Separar por semanas</option><option value="mes">Separar por meses</option><option value="anio">Separar por años</option></select></div></header>
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
        <SalesLineChart points={data.serie_ventas}/>
        <div className="analytics-grid"><RankingTable title="Más vendidos" description="Ordenados por cantidad de unidades." items={data.mas_vendidos}/><RankingTable title="Menor rotación" description="Productos vendidos con menos unidades." items={data.menos_vendidos}/></div>
        <div className="analytics-last"><RankingTable title="Productos sin ventas" description="Habilitados en Dux que no registraron ventas en el período." items={data.sin_ventas}/></div>
      </>}
  </div>
}
