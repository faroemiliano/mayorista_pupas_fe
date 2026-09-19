import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSizeStocks, saveSizeStocks, type SizeStockProduct } from '../../api/admin'

const sizes = [1, 2, 3, 4, 5]
const emptySizes = () => Object.fromEntries(sizes.map(size => [String(size), 0]))

function totalSizes(values: Record<string, number>) {
  return sizes.reduce((total, size) => total + Number(values[String(size)] || 0), 0)
}

function SizeStockForm({ product, onClose }: { product: SizeStockProduct; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<Record<string, number>>({ ...emptySizes(), ...product.talles })
  useEffect(() => setValues({ ...emptySizes(), ...product.talles }), [product])
  const total = totalSizes(values)
  const remaining = product.stock_dux - total
  const save = useMutation({
    mutationFn: () => saveSizeStocks(product.id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['size-stocks'] })
      onClose()
    },
  })

  const distributeEvenly = () => {
    const base = Math.floor(product.stock_dux / sizes.length)
    const remainder = product.stock_dux % sizes.length
    setValues(Object.fromEntries(sizes.map((size, index) => [String(size), base + (index < remainder ? 1 : 0)])))
  }

  return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" onMouseDown={onClose}>
    <form className="max-h-[94vh] w-full max-w-2xl overflow-y-auto bg-white shadow-2xl" onSubmit={event => { event.preventDefault(); save.mutate() }} onMouseDown={event => event.stopPropagation()}>
      <header className="flex items-start justify-between border-b border-neutral-200 p-6">
        <div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-neutral-500">CARGAR TALLES · ORIGEN {product.origen==='dux'?'DUX':'MANUAL'}</p><h2 className="mt-1 font-serif text-3xl font-semibold">{product.nombre}</h2><span className="mt-1 block text-xs text-neutral-500">Código Dux: {product.codigo}</span></div>
        <button type="button" className="text-3xl" onClick={onClose} aria-label="Cerrar">×</button>
      </header>

      <div className="p-6">
        <section className="grid grid-cols-3 border border-neutral-200 bg-neutral-50 text-center">
          <div className="border-r border-neutral-200 p-4"><small className="block text-[9px] font-bold uppercase tracking-wider text-neutral-500">Stock Dux</small><strong className="mt-1 block text-2xl">{product.stock_dux}</strong></div>
          <div className="border-r border-neutral-200 p-4"><small className="block text-[9px] font-bold uppercase tracking-wider text-neutral-500">Distribuido</small><strong className="mt-1 block text-2xl">{total}</strong></div>
          <div className="p-4"><small className="block text-[9px] font-bold uppercase tracking-wider text-neutral-500">Sin asignar</small><strong className={`mt-1 block text-2xl ${remaining < 0 ? 'text-red-700' : remaining > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{remaining}</strong></div>
        </section>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {sizes.map(size => <label className="border border-neutral-200 bg-white p-4 text-center" key={size}>
            <span className="text-xs font-extrabold uppercase tracking-wider">Talle {size}</span>
            <input className="mt-3 h-14 w-full border border-neutral-300 bg-neutral-50 text-center text-2xl font-bold outline-none focus:border-black" type="number" min="0" max={product.stock_dux} value={values[String(size)] || 0} onFocus={event => event.currentTarget.select()} onChange={event => setValues(current => ({ ...current, [String(size)]: Math.max(0, Number(event.target.value)) }))}/>
          </label>)}
        </div>

        <div className="mt-5 flex flex-wrap gap-2"><button type="button" className="border border-neutral-300 px-4 py-2 text-xs font-bold" onClick={distributeEvenly}>Repartir en partes iguales</button><button type="button" className="border border-neutral-300 px-4 py-2 text-xs font-bold" onClick={() => setValues(emptySizes())}>Limpiar talles</button></div>
        {remaining > 0 && <p className="mt-5 border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Quedarán {remaining} unidades sin publicar por talle. Podés guardarlo así y asignarlas más adelante.</p>}
        {remaining < 0 && <p className="mt-5 border border-red-200 bg-red-50 p-3 text-xs text-red-800">Distribuiste {-remaining} unidades más que el stock disponible en Dux.</p>}
        {product.origen==='dux'&&<p className="mt-5 border border-neutral-300 bg-neutral-50 p-3 text-xs text-neutral-700">Estos talles llegaron desde Dux. Si guardás cambios, pasarán temporalmente a carga manual hasta la próxima sincronización que vuelva a informar talles.</p>}
        {save.isError && <p className="mt-5 border border-red-200 bg-red-50 p-3 text-xs text-red-800">{save.error.message}</p>}
      </div>

      <footer className="flex justify-end gap-3 border-t border-neutral-200 bg-neutral-50 p-5"><button type="button" className="border border-neutral-300 bg-white px-5 py-3 text-xs font-bold" onClick={onClose}>Cancelar</button><button className="bg-black px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white disabled:opacity-40" disabled={remaining < 0 || save.isPending}>{save.isPending ? 'Guardando…' : 'Guardar stock por talles'}</button></footer>
    </form>
  </div>
}

export function AdminSizeStock() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<SizeStockProduct | null>(null)
  const query = useQuery({ queryKey: ['size-stocks', page, search], queryFn: () => getSizeStocks(page, search) })

  return <div className="admin-page">
    <header className="admin-page-header"><div><p className="eyebrow">INVENTARIO LOCAL</p><h1>Control de stock por talles</h1><span>Los talles informados por Dux se sincronizan solos; los demás se cargan manualmente.</span></div></header>
    <section className="admin-panel-card">
      <div className="admin-card-header"><input className="admin-filter w-full max-w-md" placeholder="Buscar por nombre o código Dux" value={search} onChange={event => { setSearch(event.target.value); setPage(1) }}/><strong>{query.data?.total ?? 0} productos</strong></div>
      {query.isLoading ? <div className="admin-status"><span className="loader"/></div> : !query.data?.items.length ? <div className="admin-status"><strong>No encontramos productos</strong></div> : <div className="divide-y divide-neutral-200">{query.data.items.map(product => { const assigned = totalSizes(product.talles); return <article className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center" key={product.id}><div className="min-w-0"><strong className="block truncate">{product.nombre}</strong><small className="text-neutral-500">{product.codigo} · Stock Dux: {product.stock_dux}</small><div className="mt-2 flex flex-wrap gap-1.5">{sizes.map(size => <span className="border border-neutral-200 bg-neutral-50 px-2 py-1 text-[10px]" key={size}>T{size}: <b>{product.talles[String(size)] || 0}</b></span>)}</div></div><div className="flex shrink-0 items-center gap-3"><span className={`text-xs font-bold ${product.origen==='dux'?'text-blue-700':assigned?'text-emerald-700':'text-amber-700'}`}>{product.origen==='dux'?`Dux · ${assigned} unidades`:assigned?`Manual · ${assigned} unidades`:'Pendiente'}</span><button className="bg-black px-4 py-2.5 text-xs font-bold text-white" onClick={() => setSelected(product)}>{assigned ? 'Modificar talles' : 'Cargar talles'}</button></div></article>})}</div>}
    </section>
    {query.data && query.data.total_paginas > 1 && <nav className="pagination"><button disabled={page === 1} onClick={() => setPage(value => value - 1)}>← Anterior</button><span>{page} / {query.data.total_paginas}</span><button disabled={page >= query.data.total_paginas} onClick={() => setPage(value => value + 1)}>Siguiente →</button></nav>}
    {selected && <SizeStockForm product={selected} onClose={() => setSelected(null)}/>} 
  </div>
}
