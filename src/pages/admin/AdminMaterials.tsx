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
  const activeDrive = driveLinks[0]
  const save = useMutation({
    mutationFn: async (url: string) => {
      const created = await createClientMaterial({ titulo: 'Carpeta de material Pupas', descripcion: url, nombre_archivo: 'acceso-drive.gif', contenido_base64: TRANSPARENT_GIF })
      await Promise.all(driveLinks.map(material => deleteClientMaterial(material.id)))
      return created
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-client-materials'] }),
        queryClient.invalidateQueries({ queryKey: ['client-materials'] }),
      ])
      setMessage('El enlace de Drive quedó publicado para los clientes.')
    },
  })
  const remove = useMutation({
    mutationFn: () => Promise.all(driveLinks.map(material => deleteClientMaterial(material.id))),
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
    const url = String(new FormData(event.currentTarget).get('drive_url') || '').trim()
    if (!isDriveUrl(url)) {
      setMessage('Ingresá un enlace válido de Google Drive.')
      return
    }
    save.mutate(url)
  }

  return <div className="admin-page">
    <header className="admin-page-header"><div><p className="eyebrow">CONTENIDO PARA CLIENTES</p><h1>Material para tiendas</h1><span>Publicá una carpeta de Google Drive para que tus clientes accedan a todo el contenido desde un solo lugar.</span></div></header>

    <section className="admin-panel-card p-5 sm:p-7">
      <form className="grid gap-5" onSubmit={submit}>
        <label className="text-xs font-bold">Enlace de la carpeta de Google Drive
          <input className="admin-filter mt-2 w-full" required type="url" name="drive_url" placeholder="https://drive.google.com/drive/folders/..." defaultValue={activeDrive?.descripcion || ''}/>
        </label>
        <div className="border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-600"><strong className="block text-neutral-900">Antes de publicarlo</strong>Configurá la carpeta en Drive como “Cualquier persona que tenga el enlace” para que los clientes puedan abrirla sin solicitar permiso.</div>
        {message && <p className={`p-3 text-sm ${message.includes('válido') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>{message}</p>}
        {save.isError && <p className="bg-red-50 p-3 text-sm text-red-700">{save.error.message}</p>}
        <button className="bg-black px-6 py-3 text-xs font-bold uppercase text-white disabled:opacity-40 lg:justify-self-end" disabled={save.isPending}>{save.isPending ? 'Publicando enlace…' : activeDrive ? 'Actualizar enlace de Drive' : 'Publicar enlace de Drive'}</button>
      </form>
    </section>

    <section className="admin-panel-card p-5 sm:p-7">
      <p className="eyebrow">ENLACE ACTUAL</p>
      {materials.isLoading
        ? <div className="admin-status"><span className="loader"/></div>
        : activeDrive
          ? <div className="mt-4 flex flex-col gap-4 border border-neutral-200 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><strong className="block">Carpeta publicada</strong><a className="mt-2 block truncate text-xs text-neutral-500" href={activeDrive.descripcion || '#'} target="_blank" rel="noreferrer">{activeDrive.descripcion}</a></div><button className="shrink-0 border border-red-200 px-4 py-2 text-[10px] font-bold uppercase text-red-700" disabled={remove.isPending} onClick={() => { if (window.confirm('¿Quitar el acceso al Drive para todos los clientes?')) remove.mutate() }}>Quitar enlace</button></div>
          : <div className="mt-4 border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">Todavía no publicaste una carpeta de Drive.</div>}
    </section>
  </div>
}
