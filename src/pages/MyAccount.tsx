import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getCurrentUser, updateProfile } from '../api/auth'
import { getMyOrders } from '../api/orders'
import type { Order } from '../types/order'
import { formatCurrency } from '../utils/currency'
import { useAuth } from '../context/AuthContext'

const statusLabels: Record<string,string> = { pendiente:'Pendiente', contactado:'Contactado', confirmado:'Confirmado', cancelado:'Cancelado' }

export function MyAccount() {
  const queryClient = useQueryClient()
  const { refreshUser } = useAuth()
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Order|null>(null)
  const profile = useQuery({ queryKey:['my-profile'], queryFn:getCurrentUser })
  const orders = useQuery({ queryKey:['my-orders',page], queryFn:()=>getMyOrders(page) })
  const update = useMutation({
    mutationFn:updateProfile,
    onSuccess:(user)=>{queryClient.setQueryData(['my-profile'],user);void refreshUser()},
  })
  const submit = (event:FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data=new FormData(event.currentTarget)
    const documento=String(data.get('documento')||'').replace(/\D/g,'')
    update.mutate({nombre:String(data.get('nombre')),telefono:String(data.get('telefono')),documento:documento||null})
  }
  const field='mt-1.5 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#8d3c67] focus:ring-4 focus:ring-rose-100'

  return <main className="min-h-screen bg-[#fff8fa] text-[#432839]">
    <header className="border-b border-rose-100 bg-white px-5 py-4"><div className="mx-auto flex max-w-6xl items-center justify-between"><Link className="text-xl font-black text-[#722f55] no-underline" to="/">PUPAS MAYORISTA</Link><Link className="rounded-full bg-[#722f55] px-4 py-2 text-sm font-bold text-white no-underline" to="/">← Volver a la tienda</Link></div></header>
    <div className="mx-auto max-w-6xl space-y-7 px-5 py-10">
      <div><p className="text-xs font-extrabold tracking-[3px] text-[#a95078]">ÁREA DEL CLIENTE</p><h1 className="mt-2 text-3xl font-black">Mi cuenta</h1><p className="mt-1 text-gray-500">Administrá tus datos y consultá el estado de tus pedidos.</p></div>
      <div className="grid gap-7 lg:grid-cols-[360px_1fr]">
        <section className="h-fit rounded-2xl border border-rose-100 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Mis datos</h2>{profile.isLoading?<p className="mt-5 text-sm text-gray-500">Cargando…</p>:profile.data&&<form className="mt-5 space-y-4" onSubmit={submit}>
          <label className="block text-xs font-bold">Nombre<input className={field} name="nombre" required minLength={2} defaultValue={profile.data.nombre}/></label>
          <label className="block text-xs font-bold">Email<input className={`${field} cursor-not-allowed bg-gray-50 text-gray-500`} value={profile.data.email} disabled/></label>
          <label className="block text-xs font-bold">Teléfono<input className={field} name="telefono" required minLength={6} defaultValue={profile.data.telefono||''}/></label>
          <label className="block text-xs font-bold">DNI o CUIT <span className="font-normal text-gray-400">(opcional)</span><input className={field} name="documento" inputMode="numeric" pattern="[0-9]{7,11}" defaultValue={profile.data.documento||''}/></label>
          {update.isSuccess&&<p className="rounded-lg bg-emerald-50 p-3 text-xs font-bold text-emerald-700">Datos actualizados correctamente.</p>}
          {update.isError&&<p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{update.error.message}</p>}
          <button className="w-full rounded-xl bg-[#722f55] p-3 text-sm font-extrabold text-white disabled:opacity-50" disabled={update.isPending}>{update.isPending?'Guardando…':'Guardar cambios'}</button>
        </form>}</section>
        <section className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm"><div className="border-b border-rose-100 p-6"><h2 className="text-xl font-bold">Mis pedidos</h2><p className="text-sm text-gray-500">{orders.data?.total??0} pedidos realizados</p></div>
          {orders.isLoading?<div className="p-10 text-center text-gray-500">Cargando pedidos…</div>:!orders.data?.items.length?<div className="p-12 text-center"><strong>Todavía no realizaste pedidos</strong><p className="mt-2 text-sm text-gray-500">Cuando confirmes una compra aparecerá en este historial.</p></div>:<div className="overflow-x-auto"><table className="w-full"><thead className="bg-rose-50 text-left text-xs"><tr><th className="p-4">Pedido</th><th className="p-4">Fecha</th><th className="p-4">Estado</th><th className="p-4">Unidades</th><th className="p-4">Total</th><th></th></tr></thead><tbody>{orders.data.items.map(order=><tr className="border-t border-rose-50 text-sm" key={order.id}><td className="p-4 font-bold">{order.codigo}</td><td className="p-4">{new Date(order.creado_en).toLocaleDateString('es-AR')}</td><td className="p-4"><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-[#722f55]">{statusLabels[order.estado]}</span></td><td className="p-4">{order.cantidad_unidades}</td><td className="p-4 font-bold">{formatCurrency(Number(order.total))}</td><td className="p-4"><button className="font-bold text-[#8d3c67]" onClick={()=>setSelected(order)}>Ver detalle</button></td></tr>)}</tbody></table></div>}
          {orders.data&&orders.data.total_paginas>1&&<div className="flex items-center justify-center gap-4 border-t p-4"><button disabled={page===1} onClick={()=>setPage(v=>v-1)}>← Anterior</button><span className="text-sm">Página {page} de {orders.data.total_paginas}</span><button disabled={page>=orders.data.total_paginas} onClick={()=>setPage(v=>v+1)}>Siguiente →</button></div>}
        </section>
      </div>
    </div>
    {selected&&<div className="fixed inset-0 z-50 grid place-items-center bg-[#27131f]/70 p-4" onMouseDown={()=>setSelected(null)}><section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onMouseDown={e=>e.stopPropagation()}><div className="flex justify-between"><div><p className="text-xs font-bold text-[#a95078]">{selected.codigo}</p><h2 className="text-2xl font-black">Detalle del pedido</h2></div><button className="text-3xl" onClick={()=>setSelected(null)}>×</button></div><div className="mt-5 rounded-xl bg-rose-50 p-4 text-sm"><strong>Estado: {statusLabels[selected.estado]}</strong><p className="mt-1">{selected.direccion}, {selected.localidad}, {selected.provincia}</p></div><div className="mt-5 divide-y">{selected.items.map(item=><article className="flex justify-between gap-4 py-3 text-sm" key={item.id}><div><strong>{item.producto_nombre}</strong><p className="text-gray-500">{item.cantidad} unidades · {formatCurrency(Number(item.precio_unitario))} c/u</p></div><strong>{formatCurrency(Number(item.subtotal))}</strong></article>)}</div><div className="mt-5 space-y-2 border-t pt-4 text-sm"><div className="flex justify-between"><span>Total sin descuento</span><strong>{formatCurrency(Number(selected.subtotal_sin_descuento))}</strong></div><div className="flex justify-between text-emerald-700"><span>Descuento</span><strong>− {formatCurrency(Number(selected.descuento_aplicado))}</strong></div><div className="flex justify-between text-lg"><span>Total final</span><strong>{formatCurrency(Number(selected.total))}</strong></div></div></section></div>}
  </main>
}
