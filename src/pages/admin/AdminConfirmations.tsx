import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPatch } from '../../api/client'
import type { AuthUser } from '../../types/auth'

type StatusFilter = 'todos' | 'pendiente' | 'aprobado' | 'rechazado'
const labels = { pendiente:'Pendiente', aprobado:'Aprobado', rechazado:'Rechazado' }

export function AdminConfirmations() {
  const queryClient=useQueryClient()
  const [filter,setFilter]=useState<StatusFilter>('todos')
  const users=useQuery({queryKey:['admin-users'],queryFn:()=>apiGet<AuthUser[]>('/api/admin/usuarios/')})
  const update=useMutation({
    mutationFn:({id,estado}:{id:number;estado:'aprobado'|'rechazado'})=>apiPatch<AuthUser>(`/api/admin/usuarios/${id}/estado`,{estado}),
    onSuccess:()=>queryClient.invalidateQueries({queryKey:['admin-users']}),
  })
  const all=users.data??[]
  const visible=filter==='todos'?all:all.filter(user=>user.estado_registro===filter)
  const count=(status:Exclude<StatusFilter,'todos'>)=>all.filter(user=>user.estado_registro===status).length

  return <div className="admin-page">
    <header className="admin-page-header"><div><p className="eyebrow">GESTIÓN DE ACCESOS</p><h1>Confirmaciones</h1><span>Historial completo de solicitudes mayoristas y su estado.</span></div></header>
    <section className="admin-panel-card">
      <div className="admin-card-header"><div><h2>{all.length} clientes registrados</h2><p>{count('pendiente')} pendientes · {count('aprobado')} aprobados · {count('rechazado')} rechazados</p></div></div>
      <div className="flex flex-wrap gap-2 border-b border-gray-100 p-4">{(['todos','pendiente','aprobado','rechazado'] as StatusFilter[]).map(status=><button key={status} className={`rounded-full px-4 py-2 text-xs font-bold ${filter===status?'bg-[#722f55] text-white':'bg-gray-100 text-gray-600'}`} onClick={()=>setFilter(status)}>{status==='todos'?`Todos (${all.length})`:`${labels[status]} (${count(status)})`}</button>)}</div>
      {users.isLoading?<div className="admin-status"><span className="loader"/></div>
        :!visible.length?<div className="admin-status"><strong>No hay clientes en este estado</strong></div>
        :<div className="admin-table-wrap"><table><thead><tr><th>Cliente</th><th>Contacto</th><th>Documento</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{visible.map(user=><tr key={user.id}>
          <td><strong>{user.nombre}</strong><small>Cuenta web #{user.id}</small></td>
          <td>{user.email}<small>{user.telefono||'Sin teléfono'}</small></td>
          <td>{user.documento||'No informado'}</td>
          <td>{new Date(user.creado_en).toLocaleDateString('es-AR')}</td>
          <td><span className={`admin-state ${user.estado_registro==='aprobado'?'active':''}`}>{labels[user.estado_registro]}</span></td>
          <td><div className="flex gap-2">{user.estado_registro!=='aprobado'&&<button className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50" disabled={update.isPending} onClick={()=>update.mutate({id:user.id,estado:'aprobado'})}>Aprobar</button>}{user.estado_registro!=='rechazado'&&<button className="rounded-md bg-rose-100 px-3 py-2 text-xs font-bold text-rose-800 disabled:opacity-50" disabled={update.isPending} onClick={()=>update.mutate({id:user.id,estado:'rechazado'})}>Rechazar</button>}</div></td>
        </tr>)}</tbody></table></div>}
    </section>
  </div>
}
