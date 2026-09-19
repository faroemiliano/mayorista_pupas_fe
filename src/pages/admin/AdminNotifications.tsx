import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '../../api/client'
import { createNotificationCampaign, getAdminNotifications, readNotification } from '../../api/notifications'
import type { AuthUser } from '../../types/auth'
import type { NotificationCampaign } from '../../types/notification'

const field='mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#111111] focus:ring-3 focus:ring-neutral-200'

export function AdminNotifications() {
  const navigate=useNavigate(),queryClient=useQueryClient()
  const [audience,setAudience]=useState<'todos'|'seleccionados'>('todos')
  const notifications=useQuery({queryKey:['admin-notifications'],queryFn:getAdminNotifications,refetchInterval:30000})
  const clients=useQuery({queryKey:['admin-users','approved'],queryFn:()=>apiGet<AuthUser[]>('/api/admin/usuarios/?estado=aprobado')})
  const read=useMutation({mutationFn:readNotification,onSuccess:()=>queryClient.invalidateQueries({queryKey:['admin-notifications']})})
  const campaign=useMutation({mutationFn:createNotificationCampaign})

  const submit=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault()
    const form=new FormData(event.currentTarget)
    campaign.mutate({
      tipo:String(form.get('tipo')) as NotificationCampaign['tipo'],
      titulo:String(form.get('titulo')),
      mensaje:String(form.get('mensaje')),
      destinatarios:audience,
      usuario_ids:form.getAll('usuario_ids').map(Number),
      enviar_email:form.get('enviar_email')==='on',
    },{onSuccess:()=>event.currentTarget.reset()})
  }

  return <div className="admin-page">
    <header className="admin-page-header"><div><p className="eyebrow">ACTIVIDAD Y CAMPAÑAS</p><h1>Notificaciones</h1><span>Informá novedades, productos y ofertas a tus clientes.</span></div></header>

    <section className="grid gap-6 xl:grid-cols-[1fr_.9fr]">
      <form className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm" onSubmit={submit}>
        <div className="mb-5"><h2 className="text-xl font-bold">Nueva campaña</h2><p className="mt-1 text-sm text-gray-500">La notificación aparece inmediatamente en Mi cuenta.</p></div>
        <div className="grid gap-4">
          <label className="text-xs font-bold">Tipo<select className={field} name="tipo"><option value="nuevo_producto">Nuevo producto</option><option value="oferta">Oferta</option><option value="reposicion">Reposición de stock</option><option value="informacion">Información general</option></select></label>
          <label className="text-xs font-bold">Título<input className={field} name="titulo" required minLength={3} maxLength={200} placeholder="Ej: Nueva colección disponible"/></label>
          <label className="text-xs font-bold">Mensaje<textarea className={field} name="mensaje" required minLength={5} maxLength={2000} rows={4} placeholder="Contales la novedad a tus clientes…"/></label>
          <fieldset><legend className="mb-2 text-xs font-bold">Destinatarios</legend><div className="flex gap-2"><button type="button" className={`rounded-full px-4 py-2 text-xs font-bold ${audience==='todos'?'bg-[#111111] text-white':'bg-gray-100'}`} onClick={()=>setAudience('todos')}>Todos los aprobados ({clients.data?.length??0})</button><button type="button" className={`rounded-full px-4 py-2 text-xs font-bold ${audience==='seleccionados'?'bg-[#111111] text-white':'bg-gray-100'}`} onClick={()=>setAudience('seleccionados')}>Seleccionar clientes</button></div></fieldset>
          {audience==='seleccionados'&&<label className="text-xs font-bold">Clientes<select className={`${field} min-h-32`} name="usuario_ids" multiple required>{clients.data?.map(client=><option key={client.id} value={client.id}>{client.nombre} · {client.email}</option>)}</select><small className="mt-1 block font-normal text-gray-400">Usá Ctrl/Cmd para seleccionar más de uno.</small></label>}
          <label className="flex items-start gap-3 rounded-lg bg-neutral-50 p-4 text-sm"><input className="mt-1 size-4 accent-[#111111]" type="checkbox" name="enviar_email"/><span><strong className="block">Enviar también por email</strong><small className="text-gray-500">Solo se enviará a clientes que hayan aceptado promociones.</small></span></label>
          {campaign.isSuccess&&<p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Campaña enviada: {campaign.data.notificaciones_creadas} notificaciones y {campaign.data.emails_programados} emails programados.</p>}
          {campaign.isError&&<p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{campaign.error.message}</p>}
          <button className="rounded-lg bg-[#111111] px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50" disabled={campaign.isPending}>{campaign.isPending?'Enviando campaña…':'Enviar notificación'}</button>
        </div>
      </form>

      <section className="admin-panel-card h-fit"><div className="admin-card-header"><div><h2>{notifications.data?.no_leidas??0} avisos administrativos sin leer</h2><p>Nuevos pedidos y acontecimientos internos.</p></div></div>{notifications.isLoading?<div className="admin-status"><span className="loader"/></div>:!notifications.data?.items.length?<div className="admin-status"><strong>No hay notificaciones todavía</strong></div>:<div className="divide-y">{notifications.data.items.map(item=><article className={`flex gap-4 p-5 ${item.pedido_id?'cursor-pointer hover:bg-neutral-50':''} ${item.leida?'bg-white':'bg-neutral-50'}`} key={item.id} onClick={()=>{if(!item.pedido_id)return;if(!item.leida)read.mutate(item.id);navigate(`/admin/pedidos?pedido_id=${item.pedido_id}`)}}><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#111111] text-white">{item.tipo==='pedido_nuevo'?'▤':'!'}</span><div className="grow"><strong>{item.titulo}</strong><p className="mt-1 text-sm text-gray-600">{item.mensaje}</p><small className="mt-2 block text-gray-400">{new Date(item.creada_en).toLocaleString('es-AR')}</small></div>{!item.leida&&<button className="text-xs font-bold text-[#111111]" disabled={read.isPending} onClick={event=>{event.stopPropagation();read.mutate(item.id)}}>Marcar leída</button>}</article>)}</div>}</section>
    </section>
  </div>
}
