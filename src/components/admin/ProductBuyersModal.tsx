import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProductBuyers } from '../../api/admin'
import type { Product } from '../../types/catalog'

type PeriodDays = 1 | 7 | 30 | 90 | null

export function ProductBuyersModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [days, setDays] = useState<PeriodDays>(30)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [range, setRange] = useState({ desde: '', hasta: '' })
  const customRange = Boolean(range.desde && range.hasta)
  const report = useQuery({
    queryKey: ['admin-product-buyers', product.id, days, range.desde, range.hasta],
    queryFn: () => getProductBuyers(product.id, days, range.desde, range.hasta),
  })

  const choosePeriod = (value: PeriodDays) => {
    setDays(value)
    setDesde('')
    setHasta('')
    setRange({ desde: '', hasta: '' })
  }
  const applyRange = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!desde || !hasta) return
    setDays(null)
    setRange({ desde, hasta })
  }
  const downloadCsv = () => {
    if (!report.data?.compradores.length) return
    const safe = (value: string | number) => {
      const text = String(value)
      const protectedText = /^[=+\-@]/.test(text) ? `'${text}` : text
      return `"${protectedText.replaceAll('"', '""')}"`
    }
    const rows = report.data.compradores.flatMap((buyer) =>
      buyer.talles.map((size) => [
        buyer.cliente, buyer.email || '', size.talle, size.unidades,
        buyer.unidades, buyer.pedidos,
        buyer.ultima_compra ? new Date(buyer.ultima_compra).toLocaleDateString('es-AR') : '',
      ]),
    )
    const csv = [
      ['Cliente', 'Email', 'Talle', 'Unidades del talle', 'Unidades totales', 'Pedidos', 'Última compra'],
      ...rows,
    ].map((row) => row.map(safe).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `compradores-${product.dux_codigo || product.id}.csv`.replace(/[^a-zA-Z0-9_.-]+/g, '-')
    link.click()
    URL.revokeObjectURL(url)
  }

  return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={`Compradores de ${product.nombre}`} onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <header className="flex items-start justify-between gap-4 border-b border-neutral-200 bg-neutral-50 p-5 sm:p-6">
        <div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-neutral-500">VENTAS DEL PRODUCTO</p><h2 className="mt-1 text-2xl font-bold">{product.nombre}</h2><p className="mt-1 text-sm text-neutral-500">Código {product.dux_codigo}</p></div>
        <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full border border-neutral-300 bg-white text-xl" aria-label="Cerrar">×</button>
      </header>
      <div className="space-y-5 overflow-y-auto p-4 sm:p-6">
        <section className="rounded-xl border border-neutral-200 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Período</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {([[1, '24 horas'], [7, '7 días'], [30, '30 días'], [90, '90 días'], [null, 'Todo']] as const).map(([value, label]) => <button key={label} type="button" onClick={() => choosePeriod(value)} className={`rounded-full px-3 py-2 text-xs font-bold ${!customRange && days === value ? 'bg-black text-white' : 'border border-neutral-300 bg-white'}`}>{label}</button>)}
          </div>
          <form className="mt-3 flex flex-wrap items-end gap-2 border-t border-neutral-100 pt-3" onSubmit={applyRange}>
            <label className="text-xs font-bold">Desde<input required className="mt-1 block rounded-lg border border-neutral-300 px-3 py-2 text-sm" type="date" value={desde} max={hasta || undefined} onChange={event => setDesde(event.target.value)}/></label>
            <label className="text-xs font-bold">Hasta<input required className="mt-1 block rounded-lg border border-neutral-300 px-3 py-2 text-sm" type="date" value={hasta} min={desde || undefined} onChange={event => setHasta(event.target.value)}/></label>
            <button className="rounded-lg bg-black px-4 py-2.5 text-xs font-bold text-white">Aplicar fechas</button>
          </form>
        </section>
        {report.isLoading ? <div className="admin-status"><span className="loader"/><p>Buscando compradores…</p></div>
          : report.isError || !report.data ? <div className="admin-status"><strong>No se pudo cargar el informe.</strong><button onClick={() => report.refetch()}>Reintentar</button></div>
          : <>
            <section className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-xl bg-neutral-100 p-4"><small className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Clientes</small><strong className="mt-1 block text-3xl">{report.data.resumen.clientes}</strong></article>
              <article className="rounded-xl bg-neutral-100 p-4"><small className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Pedidos</small><strong className="mt-1 block text-3xl">{report.data.resumen.pedidos}</strong></article>
              <article className="rounded-xl bg-black p-4 text-white"><small className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">Unidades</small><strong className="mt-1 block text-3xl">{report.data.resumen.unidades}</strong></article>
            </section>
            <section className="rounded-xl border border-neutral-200 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Conteo total por talle</h3><p className="text-xs text-neutral-500">Suma de todos los compradores del período.</p></div><button type="button" onClick={downloadCsv} disabled={!report.data.compradores.length} className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-bold disabled:opacity-40">Descargar CSV</button></div><div className="mt-3 flex flex-wrap gap-2">{report.data.talles.length ? report.data.talles.map(size => <span key={size.talle} className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"><b>Talle {size.talle}:</b> {size.unidades}</span>) : <span className="text-sm text-neutral-500">Sin unidades vendidas.</span>}</div></section>
            <section><div className="mb-3"><h3 className="font-bold">Quiénes compraron</h3><p className="text-xs text-neutral-500">Detalle de unidades y talles por persona.</p></div>{report.data.compradores.length ? <div className="overflow-x-auto rounded-xl border border-neutral-200"><table className="w-full min-w-[720px] text-sm"><thead className="bg-neutral-100 text-left text-[10px] uppercase tracking-wider text-neutral-500"><tr><th className="p-3">Cliente</th><th className="p-3">Talles comprados</th><th className="p-3 text-right">Unidades</th><th className="p-3 text-right">Pedidos</th><th className="p-3 text-right">Última compra</th></tr></thead><tbody>{report.data.compradores.map((buyer, index) => <tr key={`${buyer.usuario_id ?? buyer.email ?? buyer.cliente}-${index}`} className="border-t border-neutral-200"><td className="p-3"><strong>{buyer.cliente}</strong>{buyer.email && <small className="block text-neutral-500">{buyer.email}</small>}</td><td className="p-3"><div className="flex flex-wrap gap-1">{buyer.talles.map(size => <span key={size.talle} className="rounded bg-neutral-100 px-2 py-1 text-xs"><b>Talle {size.talle}</b>: {size.unidades}</span>)}</div></td><td className="p-3 text-right text-lg font-bold">{buyer.unidades}</td><td className="p-3 text-right">{buyer.pedidos}</td><td className="p-3 text-right">{buyer.ultima_compra ? new Date(buyer.ultima_compra).toLocaleDateString('es-AR') : '—'}</td></tr>)}</tbody></table></div> : <p className="rounded-xl bg-neutral-100 p-5 text-sm text-neutral-600">Nadie compró este producto en el período elegido.</p>}</section>
            <p className="text-xs text-neutral-500">{report.data.alcance}</p>
          </>}
      </div>
    </section>
  </div>
}
