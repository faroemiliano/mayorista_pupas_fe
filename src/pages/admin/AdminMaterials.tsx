import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClientMaterial, deleteClientMaterial, getAdminClientMaterials } from '../../api/materials'

const TRANSPARENT_GIF = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

function isDriveUrl(value: string | null | undefined) {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && ['drive.google.com', 'docs.google.com'].includes(url.hostname)
  } catch {
    return false
  }
}

export function AdminMaterials() {
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const materials = useQuery({ queryKey: ['admin-client-materials'], queryFn: getAdminClientMaterials })
  const driveLinks = materials.data?.filter(material => isDriveUrl(material.descripcion)) ?? []
  const save = useMutation({
    mutationFn: ({ titulo, url }: { titulo: string; url: string }) => createClientMaterial({ titulo, descripcion: url, nombre_archivo: 'acceso-drive.gif', contenido_base64: TRANSPARENT_GIF }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-client-materials'] }),
        queryClient.invalidateQueries({ queryKey: ['client-materials'] }),
      ])
      setMessage('El enlace de Drive quedó publicado para los clientes.')
    },
  })
  const remove = useMutation({
    mutationFn: deleteClientMaterial,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-client-materials'] }),
        queryClient.invalidateQueries({ queryKey: ['client-materials'] }),
      ])
      setMessage('El enlace dejó de estar disponible para los clientes.')
    },
  })

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    const form = new FormData(event.currentTarget)
    const titulo = String(form.get('title') || '').trim()
    const url = String(form.get('drive_url') || '').trim()
    if (titulo.length < 2) {
      setMessage('Indicá un título para que los clientes sepan qué contiene el Drive.')
      return
    }
    if (!isDriveUrl(url)) {
      setMessage('Ingresá un enlace válido de Google Drive.')
      return
    }
    save.mutate({ titulo, url }, { onSuccess: () => event.currentTarget.reset() })
  }

  return <div className="admin-page">
    <header className="admin-page-header"><div><p className="eyebrow">CONTENIDO PARA CLIENTES</p><h1>Material para tiendas</h1><span>Publicá varias carpetas de Google Drive: por ejemplo, una para fotos y otra para videos.</span></div></header>

    <section className="admin-panel-card p-5 sm:p-7">
      <form className="grid gap-5" onSubmit={submit}>
        <label className="text-xs font-bold">Título que verán los clientes
          <input className="admin-filter mt-2 w-full" required name="title" maxLength={160} placeholder="Ej.: Drive de fotos y videos" defaultValue="Drive de fotos y videos" />
        </label>
        <label className="text-xs font-bold">Enlace de la carpeta de Google Drive
          <input className="admin-filter mt-2 w-full" required type="url" name="drive_url" placeholder="https://drive.google.com/drive/folders/..." />
        </label>
        <div className="border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-600"><strong className="block text-neutral-900">Antes de publicarlo</strong>Configurá cada carpeta en Drive como “Cualquier persona que tenga el enlace”. Publicar una nueva no reemplaza las ya publicadas.</div>
        {message && <p className={`p-3 text-sm ${message.includes('válido') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>{message}</p>}
        {save.isError && <p className="bg-red-50 p-3 text-sm text-red-700">{save.error.message}</p>}
        <button className="bg-black px-6 py-3 text-xs font-bold uppercase text-white disabled:opacity-40 lg:justify-self-end" disabled={save.isPending}>{save.isPending ? 'Publicando enlace…' : 'Publicar otro Drive'}</button>
      </form>
    </section>

    <section className="admin-panel-card p-5 sm:p-7">
      <p className="eyebrow">DRIVES PUBLICADOS</p>
      {materials.isLoading
        ? <div className="admin-status"><span className="loader"/></div>
        : driveLinks.length > 0
          ? <div className="mt-4 grid gap-3">{driveLinks.map(drive => <div key={drive.id} className="flex flex-col gap-4 border border-neutral-200 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><strong className="block">{drive.titulo === 'Carpeta de material Pupas' ? 'Drive de fotos y videos' : drive.titulo}</strong><a className="mt-2 block truncate text-xs text-neutral-500" href={drive.descripcion || '#'} target="_blank" rel="noreferrer">{drive.descripcion}</a></div><button className="shrink-0 border border-red-200 px-4 py-2 text-[10px] font-bold uppercase text-red-700" disabled={remove.isPending} onClick={() => { if (window.confirm(`¿Quitar “${drive.titulo === 'Carpeta de material Pupas' ? 'Drive de fotos y videos' : drive.titulo}” para todos los clientes?`)) remove.mutate(drive.id) }}>Quitar enlace</button></div>)}</div>
          : <div className="mt-4 border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">Todavía no publicaste una carpeta de Drive.</div>}
    </section>
  </div>
}
