import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getCurrentUser, updateProfile } from '../api/auth'
import { getMyOrders } from '../api/orders'
import type { Order } from '../types/order'
import { formatCurrency } from '../utils/currency'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getProduct } from '../api/catalog'
import { getMyNotifications,readNotification } from '../api/notifications'
import { useShoppingTools } from '../context/ShoppingToolsContext'
import { CompactProductCard } from '../components/catalog/CompactProductCard'
import { Brand } from '../components/layout/Brand'
import { ClientMaterials } from '../components/account/ClientMaterials'
import { whatsappUrl } from '../config/contact'

const statusLabels: Record<string,string> = { pendiente:'Pendiente', contactado:'Contactado', confirmado:'Confirmado', cancelado:'Cancelado' }
const statusDetails: Record<string,string> = {
  pendiente: 'Recibimos tu pedido y está esperando revisión.',
  contactado: 'Nuestro equipo ya se comunicó para continuar la compra.',
  confirmado: 'El pedido fue confirmado correctamente.',
  cancelado: 'Este pedido fue cancelado.',
}
const statusClasses: Record<string,string> = {
  pendiente: 'border-amber-200 bg-amber-50 text-amber-800',
  contactado: 'border-blue-200 bg-blue-50 text-blue-800',
  confirmado: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  cancelado: 'border-red-200 bg-red-50 text-red-800',
}

function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-3 sm:p-6" onMouseDown={onClose}>
    <section className="max-h-[94vh] w-full max-w-3xl overflow-y-auto bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="order-detail-title" onMouseDown={event => event.stopPropagation()}>
      <header className="sticky top-0 z-10 flex items-start justify-between border-b border-neutral-200 bg-white px-5 py-5 sm:px-7">
        <div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-neutral-500">Pedido {order.codigo}</p><h2 id="order-detail-title" className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">Detalle del pedido</h2><p className="mt-1 text-xs text-neutral-500">Realizado el {new Date(order.creado_en).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })}</p></div>
        <button className="grid size-10 shrink-0 place-items-center border border-neutral-200 text-2xl transition hover:bg-neutral-100" type="button" aria-label="Cerrar detalle" onClick={onClose}>×</button>
      </header>

      <div className="space-y-7 p-5 sm:p-7">
        <section className={`border p-4 ${statusClasses[order.estado] || 'border-neutral-200 bg-neutral-50'}`}>
          <div className="flex items-center justify-between gap-4"><span className="text-[9px] font-bold uppercase tracking-[.18em]">Estado del pedido</span><strong className="text-sm uppercase">{statusLabels[order.estado]}</strong></div>
          <p className="mt-2 text-sm opacity-80">{statusDetails[order.estado]}</p>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between border-b border-neutral-200 pb-3"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-neutral-500">Productos</p><h3 className="mt-1 font-serif text-2xl font-semibold">Tu selección</h3></div><span className="text-xs text-neutral-500">{order.cantidad_unidades} {order.cantidad_unidades === 1 ? 'unidad' : 'unidades'}</span></div>
          <div className="divide-y divide-neutral-200">{order.items.map(item => <article className="grid grid-cols-[1fr_auto] gap-4 py-4" key={item.id}>
            <div><strong className="block text-sm leading-5">{item.producto_nombre}</strong><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500"><span>Talle <b className="text-neutral-800">{item.talle}</b></span><span>Cantidad <b className="text-neutral-800">{item.cantidad}</b></span><span>Precio unitario <b className="text-neutral-800">{formatCurrency(Number(item.precio_unitario))}</b></span></div></div>
            <div className="text-right"><small className="block text-[9px] uppercase tracking-wider text-neutral-400">Subtotal</small><strong className="mt-1 block text-sm">{formatCurrency(Number(item.subtotal))}</strong></div>
          </article>)}</div>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="border border-neutral-200 p-5"><p className="text-[9px] font-bold uppercase tracking-[.18em] text-neutral-500">Entrega</p><h3 className="mt-2 font-serif text-xl font-semibold">Dirección del pedido</h3><p className="mt-3 text-sm font-medium leading-6">{order.direccion}<br/>{order.localidad}, {order.provincia}</p>{order.observaciones && <div className="mt-4 border-t border-neutral-200 pt-4"><small className="font-bold uppercase tracking-wider text-neutral-500">Observaciones</small><p className="mt-1 text-sm leading-5 text-neutral-600">{order.observaciones}</p></div>}</section>
          <section className="border border-neutral-200 bg-neutral-50 p-5"><p className="text-[9px] font-bold uppercase tracking-[.18em] text-neutral-500">Resumen</p><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><span className="text-neutral-600">Subtotal</span><strong>{formatCurrency(Number(order.subtotal_sin_descuento))}</strong></div><div className="flex justify-between gap-4 text-emerald-700"><span>Descuento aplicado</span><strong>− {formatCurrency(Number(order.descuento_aplicado))}</strong></div><div className="flex items-end justify-between gap-4 border-t border-neutral-300 pt-4"><span className="font-bold">Total del pedido</span><strong className="font-serif text-2xl">{formatCurrency(Number(order.total))}</strong></div></div></section>
        </div>

        <section className="border-t border-neutral-200 pt-5"><p className="mb-3 text-xs leading-5 text-neutral-500">¿Necesitás modificar o consultar algo de este pedido? Escribinos indicando el código <strong className="text-neutral-800">{order.codigo}</strong>.</p><a className="block bg-emerald-600 p-3.5 text-center text-sm font-bold text-white no-underline transition hover:bg-emerald-700" target="_blank" rel="noreferrer" href={whatsappUrl(`Hola, necesito consultar por el pedido ${order.codigo}.`)}>Consultar este pedido por WhatsApp</a></section>
      </div>
    </section>
  </div>
}

export function MyAccount() {
  const queryClient = useQueryClient()
  const { refreshUser, logout } = useAuth()
  const navigate=useNavigate()
  const [searchParams]=useSearchParams()
  const cart=useCart()
  const tools=useShoppingTools()
  const [active,setActive]=useState<'summary'|'orders'|'profile'|'notifications'|'favorites'|'recent'|'materials'>(()=>searchParams.get('seccion')==='notificaciones'?'notifications':searchParams.get('seccion')==='profile'?'profile':searchParams.get('seccion')==='materiales'?'materials':'summary')
  const [reordering,setReordering]=useState<number|null>(null)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Order|null>(null)
  const profile = useQuery({ queryKey:['my-profile'], queryFn:getCurrentUser })
  const orders = useQuery({ queryKey:['my-orders',page], queryFn:()=>getMyOrders(page) })
  const notifications=useQuery({queryKey:['my-notifications'],queryFn:getMyNotifications})
  const markRead=useMutation({mutationFn:readNotification,onSuccess:()=>queryClient.invalidateQueries({queryKey:['my-notifications']})})
  const update = useMutation({
    mutationFn:updateProfile,
    onSuccess:(user)=>{queryClient.setQueryData(['my-profile'],user);void refreshUser()},
  })
  const submit = (event:FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data=new FormData(event.currentTarget)
    const documento=String(data.get('documento')||'').replace(/\D/g,'')
    const tiendaOnline=String(data.get('tienda_online_url')||'').trim()
    update.mutate({nombre:String(data.get('nombre')),telefono:String(data.get('telefono')),documento:documento||null,provincia:String(data.get('provincia')||'').trim()||null,localidad_partido:String(data.get('localidad_partido')||'').trim()||null,domicilio:String(data.get('domicilio')||'').trim()||null,canal_venta:String(data.get('canal_venta')||'').trim()||null,tienda_online_url:tiendaOnline||null,acepta_promociones_email:data.get('acepta_promociones_email')==='on'})
  }
  const field='mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black'

  return <main className="min-h-screen bg-[#f7f7f5] text-neutral-950">
    <header className="border-b border-neutral-200 bg-white px-5 py-3"><div className="relative mx-auto flex max-w-360 items-center justify-end lg:px-[3vw]"><div className="absolute left-1/2 -translate-x-1/2"><Brand/></div><Link className="border border-neutral-300 px-4 py-2 text-[9px] font-bold uppercase tracking-[.14em] text-neutral-800 no-underline transition hover:border-black" to="/">← Tienda</Link></div></header>
    <div className="mx-auto max-w-360 space-y-10 px-5 py-12 sm:px-8 lg:px-[7vw] lg:py-16">
      <div className="border-b border-neutral-200 pb-8"><p className="text-[9px] font-semibold tracking-[.25em] text-neutral-500">ÁREA DEL CLIENTE</p><h1 className="mt-3 font-serif text-5xl font-semibold">Mi cuenta</h1><p className="mt-3 text-sm text-neutral-500">Administrá tus datos y consultá el estado de tus pedidos.</p></div>
      <div className="grid gap-8 lg:grid-cols-[250px_1fr] lg:gap-12">
        <aside className="flex h-fit flex-col overflow-x-auto border-y border-neutral-300 bg-white py-3 lg:sticky lg:top-36 lg:min-h-140"><div className="mb-4 hidden border-b border-neutral-200 px-4 pb-5 pt-3 lg:block"><strong className="font-serif text-xl">{profile.data?.nombre||'Mi cuenta'}</strong><small className="mt-1 block truncate text-neutral-500">{profile.data?.email}</small></div><nav className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col">{([{id:'summary',label:'Resumen',icon:'⌂'},{id:'orders',label:'Mis pedidos',icon:'▤'},{id:'materials',label:'Material para mi tienda',icon:'▧'},{id:'profile',label:'Mis datos',icon:'♙'},{id:'notifications',label:'Notificaciones',icon:'●'},{id:'favorites',label:'Favoritos',icon:'♥'},{id:'recent',label:'Vistos recientemente',icon:'◷'}] as const).map(item=><button className={`flex items-center gap-3 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[.1em] transition ${active===item.id?'bg-black text-white':'text-neutral-600 hover:bg-neutral-100 hover:text-black'}`} key={item.id} onClick={()=>setActive(item.id)}><span>{item.icon}</span>{item.label}{item.id==='notifications'&&Boolean(notifications.data?.no_leidas)&&<b className="ml-auto rounded-full bg-white px-2 text-[9px] text-black">{notifications.data?.no_leidas}</b>}</button>)}</nav><button className="mt-auto hidden items-center gap-3 border-t border-neutral-200 px-4 pt-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-black lg:flex" onClick={()=>{logout();navigate('/')}}><span>↪</span>Cerrar sesión</button></aside>
        <div className="min-w-0">
        {active==='summary'&&<section className="space-y-5"><div className="grid gap-4 sm:grid-cols-3"><button className="rounded-none border border-neutral-200 bg-white p-5 text-left " onClick={()=>setActive('orders')}><small className="font-bold text-gray-500">PEDIDOS</small><strong className="mt-2 block text-3xl">{orders.data?.total??0}</strong><span className="text-xs text-neutral-900">Ver historial →</span></button><button className="rounded-none border border-neutral-200 bg-white p-5 text-left " onClick={()=>setActive('notifications')}><small className="font-bold text-gray-500">SIN LEER</small><strong className="mt-2 block text-3xl">{notifications.data?.no_leidas??0}</strong><span className="text-xs text-neutral-900">Ver notificaciones →</span></button><button className="rounded-none border border-neutral-200 bg-white p-5 text-left " onClick={()=>setActive('favorites')}><small className="font-bold text-gray-500">FAVORITOS</small><strong className="mt-2 block text-3xl">{tools.favorites.length}</strong><span className="text-xs text-neutral-900">Ver productos →</span></button></div><div className="rounded-none border border-neutral-200 bg-white p-6"><h2 className="font-serif text-3xl font-semibold">Actividad reciente</h2>{orders.data?.items.slice(0,3).map(order=><button className="mt-3 flex w-full justify-between rounded-none bg-gray-50 p-4 text-left" key={order.id} onClick={()=>setSelected(order)}><span><strong>{order.codigo}</strong><small className="block text-gray-500">{new Date(order.creado_en).toLocaleDateString('es-AR')}</small></span><span className="text-right"><strong>{formatCurrency(Number(order.total))}</strong><small className="block text-neutral-900">{statusLabels[order.estado]}</small></span></button>)}{!orders.data?.items.length&&<p className="mt-4 text-sm text-gray-500">Todavía no realizaste pedidos.</p>}</div></section>}
      {active==='notifications'&&<section className="rounded-none border border-neutral-200 bg-white p-5"><h2 className="font-bold">Notificaciones {notifications.data&&notifications.data.no_leidas>0&&<span className="ml-2 border border-black bg-black px-2 py-1 text-xs text-white">{notifications.data.no_leidas}</span>}</h2><div className="mt-3 grid gap-2">{notifications.data?.items.map(item=><article className={`rounded-none p-3 text-left text-sm ${item.leida?'bg-gray-50':'bg-neutral-50'}`} key={item.id}><button className="w-full text-left" onClick={()=>!item.leida&&markRead.mutate(item.id)}><strong>{item.titulo}</strong><span className="mt-1 block text-gray-600">{item.mensaje}</span><small className="mt-2 block text-gray-400">{new Date(item.creada_en).toLocaleString('es-AR')}</small></button></article>)}{!notifications.data?.items.length&&<p className="p-6 text-center text-sm text-gray-500">No tenés notificaciones.</p>}</div></section>}
        {active==='profile'&&<section className="max-w-xl rounded-none border border-neutral-200 bg-white p-6 "><h2 className="font-serif text-3xl font-semibold">Mis datos</h2>{profile.isLoading?<p className="mt-5 text-sm text-gray-500">Cargando…</p>:profile.data&&<form className="mt-5 space-y-4" onSubmit={submit}>
          <label className="block text-xs font-bold">Nombre<input className={field} name="nombre" required minLength={2} defaultValue={profile.data.nombre}/></label>
          <label className="block text-xs font-bold">Email<input className={`${field} cursor-not-allowed bg-gray-50 text-gray-500`} value={profile.data.email} disabled/></label>
          <label className="block text-xs font-bold">Teléfono<input className={field} name="telefono" required minLength={6} defaultValue={profile.data.telefono||''}/></label>
          <label className="block text-xs font-bold">DNI o CUIT <span className="font-normal text-gray-400">(opcional)</span><input className={field} name="documento" inputMode="numeric" pattern="[0-9]{7,11}" defaultValue={profile.data.documento||''}/></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs font-bold">Provincia<input className={field} name="provincia" defaultValue={profile.data.provincia||''}/></label><label className="block text-xs font-bold">Localidad / Partido<input className={field} name="localidad_partido" defaultValue={profile.data.localidad_partido||''}/></label></div>
          <label className="block text-xs font-bold">Domicilio de entrega<input className={field} name="domicilio" minLength={4} defaultValue={profile.data.domicilio||''}/></label>
          <label className="block text-xs font-bold">Canal de venta<select className={field} name="canal_venta" defaultValue={profile.data.canal_venta||''}><option value="">Sin informar</option><option value="local_fisico">Local físico</option><option value="tienda_online">Tienda online</option><option value="ambos">Local físico y tienda online</option></select></label>
          <label className="block text-xs font-bold">Link de tienda online <span className="font-normal text-gray-400">(opcional)</span><input className={field} name="tienda_online_url" type="url" defaultValue={profile.data.tienda_online_url||''}/></label>
          <label className="flex items-start gap-3 rounded-none bg-neutral-50 p-4 text-sm"><input className="mt-1 size-4 accent-black" name="acepta_promociones_email" type="checkbox" defaultChecked={profile.data.acepta_promociones_email}/><span><strong className="block">Quiero recibir novedades y ofertas por email</strong><small className="mt-1 block font-normal text-gray-500">Las notificaciones importantes de tus pedidos seguirán llegando aunque no actives esta opción.</small></span></label>
          {update.isSuccess&&<p className="rounded-none bg-emerald-50 p-3 text-xs font-bold text-emerald-700">Datos actualizados correctamente.</p>}
          {update.isError&&<p className="rounded-none bg-red-50 p-3 text-xs text-red-700">{update.error.message}</p>}
          <button className="w-full rounded-none bg-black p-3 text-sm font-extrabold text-white disabled:opacity-50" disabled={update.isPending}>{update.isPending?'Guardando…':'Guardar cambios'}</button>
        </form>}</section>}
        {active==='orders'&&<section className="overflow-hidden rounded-none border border-neutral-200 bg-white "><div className="border-b border-neutral-200 p-6"><h2 className="font-serif text-3xl font-semibold">Mis pedidos</h2><p className="text-sm text-gray-500">{orders.data?.total??0} pedidos realizados</p></div>
          {orders.isLoading?<div className="p-10 text-center text-gray-500">Cargando pedidos…</div>:!orders.data?.items.length?<div className="p-12 text-center"><strong>Todavía no realizaste pedidos</strong><p className="mt-2 text-sm text-gray-500">Cuando confirmes una compra aparecerá en este historial.</p></div>:<div className="overflow-x-auto"><table className="w-full"><thead className="bg-neutral-50 text-left text-xs"><tr><th className="p-4">Pedido</th><th className="p-4">Fecha</th><th className="p-4">Estado</th><th className="p-4">Unidades</th><th className="p-4">Total</th><th></th></tr></thead><tbody>{orders.data.items.map(order=><tr className="border-t border-neutral-100 text-sm" key={order.id}><td className="p-4 font-bold">{order.codigo}</td><td className="p-4">{new Date(order.creado_en).toLocaleDateString('es-AR')}</td><td className="p-4"><span className="border border-neutral-300 bg-white px-3 py-1 text-xs font-bold text-neutral-900">{statusLabels[order.estado]}</span></td><td className="p-4">{order.cantidad_unidades}</td><td className="p-4 font-bold">{formatCurrency(Number(order.total))}</td><td className="p-4"><div className="flex flex-col gap-1"><button className="font-bold text-neutral-700" onClick={()=>setSelected(order)}>Ver detalle</button><button className="text-xs font-bold text-emerald-700" disabled={reordering===order.id} onClick={async()=>{setReordering(order.id);try{const entries=await Promise.all(order.items.filter(item=>item.producto_id).map(async item=>({product:await getProduct(item.producto_id),quantity:item.cantidad,talle:item.talle??undefined})));cart.addMany(entries);window.alert('El pedido ya está en el carrito.')}finally{setReordering(null)}}}>{reordering===order.id?'Preparando…':'Repetir pedido'}</button></div></td></tr>)}</tbody></table></div>}
          {orders.data&&orders.data.total_paginas>1&&<div className="flex items-center justify-center gap-4 border-t p-4"><button disabled={page===1} onClick={()=>setPage(v=>v-1)}>← Anterior</button><span className="text-sm">Página {page} de {orders.data.total_paginas}</span><button disabled={page>=orders.data.total_paginas} onClick={()=>setPage(v=>v+1)}>Siguiente →</button></div>}
        </section>}
        {active==='favorites'&&<section className="border border-neutral-200 bg-white p-6"><h2 className="font-serif text-3xl font-semibold">Mis favoritos</h2><p className="mt-2 text-sm text-neutral-500">Productos que guardaste para futuras compras.</p>{!tools.favorites.length?<div className="p-12 text-center text-neutral-500">Todavía no guardaste productos favoritos.</div>:<div className="mt-6 grid gap-3 sm:grid-cols-2">{tools.favorites.map(product=><CompactProductCard key={product.id} product={product}/>)}</div>}</section>}
        {active==='recent'&&<section className="border border-neutral-200 bg-white p-6"><h2 className="font-serif text-3xl font-semibold">Vistos recientemente</h2><p className="mt-2 text-sm text-neutral-500">Productos que consultaste durante tus últimas visitas.</p>{!tools.recent.length?<div className="p-12 text-center text-neutral-500">Todavía no viste productos.</div>:<div className="mt-6 grid gap-3 sm:grid-cols-2">{tools.recent.map(product=><CompactProductCard key={product.id} product={product}/>)}</div>}</section>}
        {active==='materials'&&<ClientMaterials/>}
        </div>
      </div>
      <button className="mt-10 flex w-full items-center justify-center gap-2 rounded-none border border-red-200 bg-white p-4 text-sm font-bold text-red-700 lg:hidden" onClick={()=>{logout();navigate('/')}}><span>↪</span>Cerrar sesión</button>
    </div>
    {selected && <OrderDetail order={selected} onClose={() => setSelected(null)}/>} 
  </main>
}
