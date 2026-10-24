import { useQuery } from '@tanstack/react-query'
import { type ReactNode, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProductAnalytics } from '../../api/admin'
import type { ProductAnalytics, ProductSalesRanking } from '../../types/admin'
import { formatCurrency } from '../../utils/currency'

function formatRevenue(value: number, visible: boolean) {
  return visible ? formatCurrency(value) : '••••••'
}

function RankingTable({ title, description, items, showRevenue }: { title: string; description: string; items: ProductSalesRanking[]; showRevenue: boolean }) {
  return <section className="admin-panel-card admin-table-card analytics-table">
    <div className="admin-card-header"><div><h2>{title}</h2><p>{description}</p></div></div>
    {items.length === 0
      ? <div className="analytics-empty">No hay información para este período.</div>
      : <div className="admin-table-wrap"><table><thead><tr><th>Producto</th><th>Unidades</th><th>Pedidos</th><th>Importe</th><th>Stock actual</th></tr></thead><tbody>{items.map((item, index) => <tr key={item.producto_id}><td><strong>{index + 1}. {item.nombre}</strong><small>{item.dux_codigo}</small></td><td><strong>{item.unidades_vendidas}</strong></td><td>{item.cantidad_pedidos}</td><td>{formatRevenue(Number(item.importe_vendido), showRevenue)}</td><td>{Number(item.stock_disponible)}</td></tr>)}</tbody></table></div>}
  </section>
}

function ClientRankingTable({ items, showRevenue }: { items: ProductAnalytics['mejores_clientes']; showRevenue: boolean }) {
  return <section className="admin-panel-card admin-table-card analytics-table">
    <div className="admin-card-header"><div><h2>Top 10 clientes</h2><p>Ordenados por el importe total comprado en el período seleccionado.</p></div></div>
    {!items.length
      ? <div className="analytics-empty">No hay compras registradas para este período.</div>
      : <div className="admin-table-wrap"><table><thead><tr><th>Cliente</th><th>Pedidos</th><th>Unidades</th><th>Importe comprado</th></tr></thead><tbody>{items.map((item, index) => <tr key={`${item.email || item.cliente}-${index}`}><td><strong>{index + 1}. {item.cliente}</strong>{item.email && <small>{item.email}</small>}</td><td>{item.pedidos}</td><td>{item.unidades}</td><td><strong>{formatRevenue(Number(item.importe_comprado), showRevenue)}</strong></td></tr>)}</tbody></table></div>}
  </section>
}

type CategorySalesData = ProductAnalytics['ventas_por_categoria'][number]

function CategorySales({ items, onSelect, showRevenue }: { items: ProductAnalytics['ventas_por_categoria']; onSelect: (category: CategorySalesData) => void; showRevenue: boolean }) {
  return <section className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">CATEGORÍAS PRINCIPALES</p><h2 className="text-xl font-bold">Qué se vendió por colección</h2><p className="mt-1 text-sm text-neutral-500">Unidades, importe y modelos vendidos en el período seleccionado.</p></div><span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-500">Bikinis y Pijamas</span></div>
    <div className="analytics-grid">
      {items.map(category => <article className="admin-panel-card shadow-sm" key={category.slug}>
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-5"><div><span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-neutral-500">{category.categoria}</span><strong className="mt-2 block text-4xl leading-none tracking-tight">{category.unidades_vendidas.toLocaleString('es-AR')}</strong><small className="mt-2 block font-medium text-neutral-500">unidades vendidas</small></div><div className="rounded-lg bg-black px-3 py-2 text-right text-white"><small className="block text-[9px] font-bold uppercase tracking-wider text-neutral-300">Facturación</small><strong className="mt-1 block text-sm">{formatRevenue(Number(category.importe_vendido), showRevenue)}</strong><small className="mt-1 block text-[9px] text-neutral-300">{showRevenue ? 'Visible' : 'Oculta'}</small></div></div>
        <div className="p-5">{!category.productos.length ? <div className="analytics-empty">No hubo ventas en este período.</div> : <ol className="space-y-2">{category.productos.slice(0, 6).map((product, index) => <li className="flex items-center justify-between gap-3 text-sm" key={product.producto_id}><span className="min-w-0 truncate"><b className="mr-1 text-neutral-400">{index + 1}.</b>{product.nombre}</span><strong className="shrink-0">{product.unidades_vendidas}</strong></li>)}</ol>}
        {category.productos.length > 6 && <button type="button" className="mt-4 w-full border-t border-neutral-200 pt-3 text-left text-xs font-bold uppercase tracking-wider text-neutral-700 transition hover:text-black" onClick={() => onSelect(category)}>Ver los {category.productos.length} modelos vendidos <span aria-hidden="true">→</span></button>}
        {category.productos.length > 0 && category.productos.length <= 6 && <small className="mt-4 block border-t border-neutral-100 pt-3 text-neutral-500">{category.productos.length} modelo{category.productos.length === 1 ? '' : 's'} vendido{category.productos.length === 1 ? '' : 's'} en el período</small>}</div>
      </article>)}
    </div>
  </section>
}

function CategorySalesModal({ category, onClose, showRevenue }: { category: CategorySalesData; onClose: () => void; showRevenue: boolean }) {
  return <div className="fixed inset-0 z-60 grid place-items-center bg-black/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Modelos vendidos de ${category.categoria}`} onMouseDown={onClose}>
    <section className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl" onMouseDown={event => event.stopPropagation()}>
      <header className="flex items-start justify-between gap-4 border-b border-neutral-200 bg-neutral-50 p-5 sm:p-6"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-neutral-500">Ventas por categoría</p><h2 className="mt-1 text-2xl font-bold">{category.categoria}</h2><p className="mt-1 text-sm text-neutral-500">{category.unidades_vendidas.toLocaleString('es-AR')} unidades · {formatRevenue(Number(category.importe_vendido), showRevenue)}</p></div><button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full border border-neutral-300 bg-white text-xl leading-none transition hover:bg-neutral-100" aria-label="Cerrar listado">×</button></header>
      <div className="max-h-[65vh] overflow-y-auto p-4 sm:p-6"><div className="mb-3 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-neutral-500"><span>Modelo</span><span>Unidades</span></div><ol className="divide-y divide-neutral-100">{category.productos.map((product, index) => <li className="flex items-center justify-between gap-4 py-3" key={product.producto_id}><span className="min-w-0 text-sm font-medium"><b className="mr-2 text-neutral-400">{index + 1}.</b>{product.nombre}</span><div className="shrink-0 text-right"><strong className="block text-sm">{product.unidades_vendidas}</strong><small className="text-xs text-neutral-500">{formatRevenue(Number(product.importe_vendido), showRevenue)}</small></div></li>)}</ol></div>
    </section>
  </div>
}

type Metric = 'importe' | 'unidades' | 'pedidos'

function AnalyticsSection({ step, title, description, children }: { step: string; title: string; description: string; children: ReactNode }) {
  return <section className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-neutral-200 pb-3">
      <div><p className="eyebrow">{step}</p><h2 className="mt-1 text-xl font-bold">{title}</h2><p className="mt-1 text-sm text-neutral-500">{description}</p></div>
    </div>
    {children}
  </section>
}

function rangoSemanaActual() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const valor = (tipo: string) => partes.find(parte => parte.type === tipo)?.value || ''
  const hasta = `${valor('year')}-${valor('month')}-${valor('day')}`
  const fecha = new Date(`${hasta}T12:00:00Z`)
  const diasDesdeLunes = (fecha.getUTCDay() + 6) % 7
  fecha.setUTCDate(fecha.getUTCDate() - diasDesdeLunes)
  const desde = fecha.toISOString().slice(0, 10)
  return { desde, hasta }
}

function WeeklyBalanceModal({ onClose, showRevenue }: { onClose: () => void; showRevenue: boolean }) {
  const semana = rangoSemanaActual()
  const analytics = useQuery({
    queryKey: ['admin-weekly-sales-balance', semana.desde, semana.hasta],
    queryFn: () => getProductAnalytics(7, 'dia', semana.desde, semana.hasta),
  })
  const data = analytics.data
  const pedidosSemana = data?.serie_ventas.reduce((total, punto) => total + punto.pedidos, 0) ?? 0
  const fechaDesde = new Date(`${semana.desde}T12:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
  const fechaHasta = new Date(`${semana.hasta}T12:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

  return <div className="fixed inset-0 z-60 grid place-items-center bg-black/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Balance semanal de ventas" onMouseDown={onClose}>
    <section className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl" onMouseDown={event => event.stopPropagation()}>
      <header className="flex items-start justify-between gap-4 border-b border-neutral-200 bg-neutral-50 p-5 sm:p-6"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-neutral-500">BALANCE SEMANAL</p><h2 className="mt-1 text-2xl font-bold">Ventas de esta semana</h2><p className="mt-1 text-sm text-neutral-500">Del {fechaDesde} al {fechaHasta}.</p></div><button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full border border-neutral-300 bg-white text-xl leading-none transition hover:bg-neutral-100" aria-label="Cerrar balance semanal">×</button></header>
      <div className="max-h-[65vh] overflow-y-auto p-5 sm:p-6">
        {analytics.isLoading ? <div className="admin-status"><span className="loader"/><p>Preparando el balance semanal…</p></div>
          : analytics.isError || !data ? <div className="admin-status"><strong>No se pudo cargar el balance.</strong><button onClick={() => analytics.refetch()}>Reintentar</button></div>
          : <div className="space-y-6"><section className="admin-metrics"><article><span>UNIDADES VENDIDAS</span><strong>{data.resumen.unidades_vendidas}</strong><small>Sin pedidos cancelados</small></article><article><span>PEDIDOS</span><strong>{pedidosSemana}</strong><small>Registrados en la semana</small></article><article><span>FACTURACIÓN</span><strong>{formatRevenue(Number(data.resumen.importe_vendido), showRevenue)}</strong><small>{showRevenue ? 'Total confirmado' : 'Oculta hasta revelar facturación'}</small></article><article><span>MODELOS VENDIDOS</span><strong>{data.resumen.productos_con_ventas}</strong><small>Con movimiento</small></article></section>
            <section className="rounded-xl border border-neutral-200 p-4"><div className="flex items-baseline justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-neutral-500">PRODUCTOS DESTACADOS</p><h3 className="mt-1 text-lg font-bold">Los más vendidos</h3></div><span className="text-xs text-neutral-500">Unidades</span></div>{data.mas_vendidos.length ? <ol className="mt-3 divide-y divide-neutral-100">{data.mas_vendidos.slice(0, 5).map((product, index) => <li className="flex items-center justify-between gap-4 py-2.5" key={product.producto_id}><span className="min-w-0 truncate text-sm"><b className="mr-2 text-neutral-400">{index + 1}.</b>{product.nombre}</span><strong className="shrink-0">{product.unidades_vendidas}</strong></li>)}</ol> : <p className="mt-3 text-sm text-neutral-500">Aún no hay ventas registradas esta semana.</p>}</section>
            <p className="text-center text-xs text-neutral-500">Este resumen no cambia los filtros de la Analítica principal.</p>
          </div>}
      </div>
    </section>
  </div>
}

function SalesLineChart({ points, showRevenue }: { points: ProductAnalytics['serie_ventas']; showRevenue: boolean }) {
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
  const formatValue = (value: number) => metric === 'importe' ? formatRevenue(value, showRevenue) : value.toLocaleString('es-AR')
  const labelIndexes = new Set(Array.from({ length: Math.min(6, points.length) }, (_, index) => Math.round(index * (points.length - 1) / Math.max(Math.min(6, points.length) - 1, 1))))

  return <section className="admin-panel-card overflow-hidden">
    <div className="admin-card-header flex-wrap gap-4"><div><h2>Evolución de ventas</h2><p>Seleccioná una variable y tocá cualquier punto para ver su detalle.</p></div><div className="flex border border-neutral-300 bg-white p-1">{(['importe', 'unidades', 'pedidos'] as Metric[]).map(item => <button key={item} type="button" onClick={() => setMetric(item)} className={`px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider ${metric === item ? 'bg-black text-white' : 'text-neutral-500'}`}>{item === 'importe' ? 'Facturación' : item}</button>)}</div></div>
    {!points.length ? <div className="analytics-empty">No hay datos para graficar.</div> : <>
      <div className="grid gap-0 border-b border-neutral-200 bg-neutral-50 sm:grid-cols-4">
        <div className="border-b border-neutral-200 p-4 sm:border-b-0 sm:border-r"><small className="block text-[9px] font-bold uppercase tracking-wider text-neutral-500">Intervalo</small><strong className="mt-1 block">{active?.etiqueta}</strong></div>
        <div className="border-b border-neutral-200 p-4 sm:border-b-0 sm:border-r"><small className="block text-[9px] font-bold uppercase tracking-wider text-neutral-500">Facturación</small><strong className="mt-1 block">{formatRevenue(Number(active?.importe || 0), showRevenue)}</strong></div>
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
  const [searchParams] = useSearchParams()
  const [days, setDays] = useState<number | null>(30)
  const [grouping, setGrouping] = useState<'dia' | 'semana' | 'mes' | 'anio'>('dia')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategorySalesData | null>(null)
  const [showRevenue, setShowRevenue] = useState(false)
  const [weeklyBalanceOpen, setWeeklyBalanceOpen] = useState(searchParams.get('periodo') === 'semana')
  // Una sola fecha se interpreta como el día completo elegido.
  const fechaConsultaDesde = fechaDesde || fechaHasta
  const fechaConsultaHasta = fechaHasta || fechaDesde
  const customRange = Boolean(fechaConsultaDesde && fechaConsultaHasta)
  const analytics = useQuery({
    queryKey: ['admin-product-analytics', days, grouping, fechaConsultaDesde, fechaConsultaHasta],
    queryFn: () => getProductAnalytics(days, grouping, fechaConsultaDesde, fechaConsultaHasta),
  })
  const data = analytics.data
  const importeAnterior = Number(data?.comparacion_anterior?.resumen.importe ?? 0)
  const variacionPeriodo = importeAnterior === 0 ? null : ((Number(data?.resumen.importe_vendido ?? 0) - importeAnterior) / importeAnterior) * 100

  return <div className="admin-page">
    <header className="admin-page-header items-start">
      <div><p className="eyebrow">RENDIMIENTO DE PRODUCTOS</p><h1>Analítica de ventas</h1><span>Ventas, rotación y clientes en un orden más claro.</span></div>
      <div className="w-full max-w-3xl space-y-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2"><button type="button" className="admin-filter" onClick={() => setShowRevenue(current => !current)} aria-pressed={showRevenue}>{showRevenue ? 'Ocultar facturación' : 'Mostrar facturación'}</button><button type="button" className="admin-filter !border-neutral-300 !bg-white !text-neutral-700 shadow-none" onClick={() => setWeeklyBalanceOpen(true)}>Balance de esta semana</button></div>
        <div className="flex flex-wrap items-end gap-2 border-t border-neutral-100 pt-2"><label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Desde<input aria-label="Fecha inicial" className="admin-filter mt-1 block" type="date" value={fechaDesde} max={fechaHasta || undefined} onChange={event => setFechaDesde(event.target.value)}/></label><label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Hasta<input aria-label="Fecha final" className="admin-filter mt-1 block" type="date" value={fechaHasta} min={fechaDesde || undefined} onChange={event => setFechaHasta(event.target.value)}/></label>{(fechaDesde || fechaHasta) && <button type="button" className="admin-filter" onClick={() => { setFechaDesde(''); setFechaHasta('') }}>Limpiar período</button>}<select aria-label="Período analizado" className="admin-filter" value={days ?? 'all'} disabled={customRange} onChange={(event) => setDays(event.target.value === 'all' ? null : Number(event.target.value))}><option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option><option value="90">Últimos 90 días</option><option value="365">Último año</option><option value="all">Todo el historial</option></select><select aria-label="Agrupación del gráfico" className="admin-filter" value={grouping} onChange={event => setGrouping(event.target.value as typeof grouping)}><option value="dia">Separar por días</option><option value="semana">Separar por semanas</option><option value="mes">Separar por meses</option><option value="anio">Separar por años</option></select></div>
      </div>
    </header>
    {analytics.isLoading ? <div className="admin-status"><span className="loader"/><p>Calculando ventas…</p></div>
      : analytics.isError || !data ? <div className="admin-status"><strong>No se pudo cargar la analítica</strong><button onClick={() => analytics.refetch()}>Reintentar</button></div>
      : <>
        <div className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-[auto_1fr]"><strong className="text-sm">Origen: WordPress histórico + pedidos de la tienda</strong><span className="text-sm text-neutral-500">{data.alcance}</span></div>
        {customRange && <div className="rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm"><strong>{fechaConsultaDesde === fechaConsultaHasta ? `Día elegido: ${new Date(`${fechaConsultaDesde}T00:00:00`).toLocaleDateString('es-AR', { dateStyle: 'long' })}` : `Período elegido: ${new Date(`${fechaConsultaDesde}T00:00:00`).toLocaleDateString('es-AR', { dateStyle: 'long' })} a ${new Date(`${fechaConsultaHasta}T00:00:00`).toLocaleDateString('es-AR', { dateStyle: 'long' })}`}</strong><span className="mt-1 block text-neutral-500">La comparación se realiza contra el período inmediatamente anterior de igual duración.</span></div>}
        <AnalyticsSection step="01 · VISTA GENERAL" title="Resumen del período" description="Los indicadores principales para entender el movimiento de un vistazo.">
          <section className="admin-metrics">
            <article><span>UNIDADES VENDIDAS</span><strong>{data.resumen.unidades_vendidas}</strong><small>Sin pedidos cancelados</small></article>
            <article><span>IMPORTE VENDIDO</span><strong>{formatRevenue(Number(data.resumen.importe_vendido), showRevenue)}</strong><small>{showRevenue ? 'Total confirmado en la web' : 'Tocá “Mostrar facturación” para verlo'}</small></article>
            <article><span>PRODUCTOS CON VENTAS</span><strong>{data.resumen.productos_con_ventas}</strong><small>Con movimiento en el período</small></article>
            <article className="attention"><span>SIN VENTAS</span><strong>{data.resumen.productos_sin_ventas}</strong><small>Productos habilitados sin rotación</small></article>
          </section>
          {data.comparacion_anterior && <section className="grid gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 sm:grid-cols-2"><article><span className="text-[10px] font-bold tracking-wider text-neutral-500">PERÍODO ANTERIOR</span><strong className="mt-1 block text-xl">{formatRevenue(importeAnterior, showRevenue)}</strong><small className="mt-1 block text-neutral-500">{data.comparacion_anterior.resumen.unidades} unidades · {data.comparacion_anterior.resumen.pedidos} pedidos</small></article><article className="border-t border-neutral-200 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0"><span className="text-[10px] font-bold tracking-wider text-neutral-500">VARIACIÓN DE FACTURACIÓN</span><strong className={`mt-1 block text-xl ${variacionPeriodo != null && variacionPeriodo < 0 ? 'text-red-700' : 'text-emerald-700'}`}>{showRevenue ? (variacionPeriodo == null ? 'Sin base comparable' : `${variacionPeriodo > 0 ? '+' : ''}${variacionPeriodo.toFixed(1)}%`) : '••••••'}</strong><small className="mt-1 block text-neutral-500">Respecto del período anterior de igual duración</small></article></section>}
        </AnalyticsSection>
        <AnalyticsSection step="02 · EVOLUCIÓN" title="Cómo se comportaron las ventas" description="Elegí una métrica y tocá un punto del gráfico para consultar su detalle.">
          <SalesLineChart points={data.serie_ventas} showRevenue={showRevenue}/>
        </AnalyticsSection>
        <AnalyticsSection step="03 · QUÉ SE VENDIÓ" title="Ventas por colección" description="Bikinis y pijamas, con el detalle de modelos disponibles al tocar cada colección.">
          <CategorySales items={data.ventas_por_categoria} onSelect={setSelectedCategory} showRevenue={showRevenue}/>
        </AnalyticsSection>
        <details className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5"><div><p className="eyebrow">04 · RANKINGS Y OPORTUNIDADES</p><h2 className="mt-1 text-xl font-bold">Productos y clientes destacados</h2><p className="mt-1 text-sm text-neutral-500">Abrí esta sección para consultar los listados detallados.</p></div><span className="shrink-0 rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-600">Ver detalle ↓</span></summary>
          <div className="space-y-6 border-t border-neutral-200 p-4 sm:p-6"><div className="analytics-grid"><RankingTable title="Más vendidos" description="Ordenados por cantidad de unidades." items={data.mas_vendidos} showRevenue={showRevenue}/><RankingTable title="Menor rotación" description="Productos vendidos con menos unidades." items={data.menos_vendidos} showRevenue={showRevenue}/></div><div className="analytics-last"><ClientRankingTable items={data.mejores_clientes} showRevenue={showRevenue}/></div></div>
        </details>
        {selectedCategory ? <CategorySalesModal category={selectedCategory} onClose={() => setSelectedCategory(null)} showRevenue={showRevenue}/> : null}
      </>}
    {weeklyBalanceOpen ? <WeeklyBalanceModal onClose={() => setWeeklyBalanceOpen(false)} showRevenue={showRevenue}/> : null}
  </div>
}
