import { useQuery } from '@tanstack/react-query'
import { getClientMaterials } from '../../api/materials'

function isDriveUrl(value: string | null | undefined) {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && ['drive.google.com', 'docs.google.com'].includes(url.hostname)
  } catch {
    return false
  }
}

export function ClientMaterials() {
  const materials = useQuery({ queryKey: ['client-materials'], queryFn: getClientMaterials })
  const drive = materials.data?.find(material => isDriveUrl(material.descripcion))

  return <section className="border border-neutral-200 bg-white p-6 sm:p-8">
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[.2em] text-neutral-500">Contenido para compartir</p>
      <h2 className="mt-2 font-serif text-3xl font-semibold">Material para tu tienda</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">Accedé a la carpeta compartida por Pupas para encontrar fotografías, videos y recursos disponibles para tus redes y canales de venta.</p>
    </div>

    {materials.isLoading
      ? <div className="mt-7 border border-neutral-200 p-10 text-center text-sm text-neutral-500">Buscando la carpeta compartida…</div>
      : materials.isError
        ? <div className="mt-7 border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">No se pudo consultar el material en este momento.</div>
        : drive
          ? <div className="mt-7 flex flex-col items-start gap-6 border border-neutral-200 bg-neutral-50 p-7 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4"><span className="grid size-14 shrink-0 place-items-center bg-black text-2xl text-white" aria-hidden="true">↗</span><div><strong className="font-serif text-xl">Carpeta de material Pupas</strong><p className="mt-1 text-xs leading-5 text-neutral-500">El contenido se abrirá en Google Drive en una nueva pestaña.</p></div></div>
              <a className="inline-flex bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-white no-underline transition hover:bg-neutral-700" href={drive.descripcion || '#'} target="_blank" rel="noopener noreferrer">Abrir material en Drive</a>
            </div>
          : <div className="mt-7 border border-dashed border-neutral-300 p-10 text-center"><strong className="font-serif text-xl">La carpeta todavía no está disponible</strong><p className="mt-2 text-sm text-neutral-500">Cuando el administrador publique el enlace de Drive aparecerá en este lugar.</p></div>}
  </section>
}
