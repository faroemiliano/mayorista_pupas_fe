import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getProducts } from '../../api/catalog'
import { productImageAsset } from '../../api/client'
import { confirmarCargaVideoPortada, getImagenesCatalogoParaPortada, getPortadasInicio, prepararCargaVideoPortada, updatePortadaInicio, usarImagenProductoEnPortada } from '../../api/portada'
import { useCatalogFilters } from '../../hooks/useCatalog'
import type { Product } from '../../types/catalog'
import { useNavigate } from 'react-router-dom'
import { useShoppingTools } from '../../context/ShoppingToolsContext'
import { useAuth } from '../../context/AuthContext'
import { Pagination } from '../Pagination'

const collections = [
  {
    title: 'Bikinis',
    keyword: 'bikini',
    background: 'bg-[#f3f3f1]',
    muted: 'text-neutral-500',
    copy: 'Diseños para una temporada que se vende antes de empezar.',
    imageKey: 'coleccion-bikinis',
    provisional: [
      'https://imagenes.pupasmayorista.com.ar/pupas/catalogo/productos/1971/imagenes/8311.jpg',
      'https://imagenes.pupasmayorista.com.ar/pupas/catalogo/productos/2098/imagenes/8640.jpg',
    ],
    reverse: false,
  },
  {
    title: 'Pijamas',
    keyword: 'pijama',
    background: 'bg-[#e8dfd2] text-[#211d19]',
    muted: 'text-[#74695d]',
    copy: 'Comodidad, textura y modelos pensados para todo el año.',
    imageKey: 'coleccion-pijamas',
    provisional: [
      'https://imagenes.pupasmayorista.com.ar/pupas/catalogo/productos/2004/imagenes/8434.jpg',
      'https://imagenes.pupasmayorista.com.ar/pupas/catalogo/productos/2004/imagenes/8435.jpg',
    ],
    reverse: true,
  },
] as const

function VideoSlot({ title, dark }: { title: string; dark: boolean }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const input = useRef<HTMLInputElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const [nearViewport, setNearViewport] = useState(false)
  const videoId = `video-${title.toLowerCase()}`
  const puedeEditar = user?.rol === 'admin' || user?.rol === 'admin_tecnico'
  const portadas = useQuery({ queryKey: ['portadas-inicio'], queryFn: getPortadasInicio })
  const videoUrl = portadas.isPending ? null : portadas.data?.imagenes[videoId] || null
  useEffect(() => {
    const element = container.current
    if (!element || nearViewport) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setNearViewport(true)
      observer.disconnect()
    }, { rootMargin: '150px 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [nearViewport])
  const actualizarVideo = useMutation({
    mutationFn: async (video: File) => {
      if (video.type !== 'video/mp4') throw new Error('Elegí un video MP4.')
      if (video.size > 50 * 1024 * 1024) throw new Error('El video puede pesar hasta 50 MB.')
      const carga = await prepararCargaVideoPortada(videoId, video)
      const respuesta = await fetch(carga.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': video.type, 'Cache-Control': 'public, max-age=31536000, immutable' },
        body: video,
      })
      if (!respuesta.ok) throw new Error('No se pudo subir el video a R2. Verificá la configuración de carga.')
      return confirmarCargaVideoPortada(videoId, carga.clave)
    },
    onSuccess: () => {
      setFailed(false)
      queryClient.invalidateQueries({ queryKey: ['portadas-inicio'] })
    },
  })
  return <div ref={container} className="relative mx-auto w-full max-w-135">
    <div className={`absolute -left-4 -top-4 size-20 border-l border-t ${dark ? 'border-white/30' : 'border-black/25'}`}/>
    <div className="relative aspect-[9/16] overflow-hidden bg-black">
      <div className="absolute inset-0 grid place-items-center px-7 text-center text-neutral-500">
        <div><span className="mx-auto grid size-12 place-items-center rounded-full border border-current text-lg">▶</span><strong className="mt-4 block font-serif text-xl font-medium">Video de {title}</strong><small className="mt-2 block text-[9px] uppercase tracking-[.2em]">Campaña de la colección</small></div>
      </div>
      {!failed && nearViewport && videoUrl && (
        <video
          className="relative h-full w-full object-contain"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`Video de la colección ${title}`}
          onError={() => setFailed(true)}
        />
      )}
      {puedeEditar && <button type="button" className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-black/55 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.12em] text-white backdrop-blur transition hover:bg-black disabled:cursor-wait disabled:opacity-70" disabled={actualizarVideo.isPending} onClick={() => input.current?.click()}><span className="text-sm leading-none">＋</span>{actualizarVideo.isPending ? 'Subiendo…' : 'Cambiar video'}</button>}
    </div>
    {puedeEditar && <input ref={input} className="hidden" type="file" accept="video/mp4" onChange={(event) => { const video = event.target.files?.[0]; event.currentTarget.value = ''; if (video) actualizarVideo.mutate(video) }} />}
    {actualizarVideo.isError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-center text-xs font-semibold text-red-700">{actualizarVideo.error.message}</p>}
  </div>
}

function productImage(product: Product, fallback?: string) {
  const mainImage = product.imagenes
    ?.slice()
    .sort((a, b) => Number(b.principal) - Number(a.principal) || a.orden - b.orden || a.id - b.id)[0]

  if (mainImage) return productImageAsset(mainImage.url, `/api/productos/${product.id}/imagenes/${mainImage.id}`, 640)
  if (product.imagen_url) return productImageAsset(product.imagen_url, `/api/productos/${product.id}/imagen`, 640)
  return fallback
}

function CollectionProductPhoto({ product, fallback, manualImage, manualProduct, title, slotId, onChangeImage, uploading, canEdit }: { product?: Product; fallback?: string; manualImage?: string; manualProduct?: { id: number; slug: string }; title: string; slotId: string; onChangeImage: (slotId: string) => void; uploading: boolean; canEdit: boolean }) {
  const navigate = useNavigate()
  const tools = useShoppingTools()
  const image = manualImage || (product ? productImage(product, fallback) : fallback)

  const openProduct = () => {
    if (manualProduct) {
      navigate(`/producto/${manualProduct.id}/${manualProduct.slug || 'producto'}`)
      return
    }
    if (!product) return
    tools.view(product)
    navigate(`/producto/${product.id}/${product.slug || 'producto'}`)
  }

  const content = <>
    {image
      ? <img className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" src={image} alt={manualImage ? `Imagen seleccionada de ${title}` : product?.nombre || title} loading="lazy" decoding="async"/>
      : <span className="grid h-full place-items-center text-5xl" aria-hidden="true">👙</span>}
    {canEdit && <button type="button" className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-black/55 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.12em] text-white backdrop-blur transition hover:bg-black disabled:cursor-wait disabled:opacity-70" disabled={uploading} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onChangeImage(slotId) }}><span className="text-sm leading-none">＋</span>{uploading ? 'Guardando…' : 'Cambiar foto'}</button>}
  </>

  if (manualProduct || product) return <button className="group relative block aspect-[3/4] w-full overflow-hidden bg-white/40 text-left" type="button" aria-label={`Ver ${manualProduct ? 'producto seleccionado' : product?.nombre}`} onClick={openProduct}>{content}</button>
  return <div className="group relative aspect-[3/4] w-full overflow-hidden bg-white/40">{content}</div>
}

function CollectionProducts({ keyword, imageKey, provisional, title }: { keyword: string; imageKey: string; provisional: readonly string[]; title: string }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const input = useRef<HTMLInputElement>(null)
  const [slotPending, setSlotPending] = useState<string | null>(null)
  const [pickerSlot, setPickerSlot] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [pickerPage, setPickerPage] = useState(1)
  const filters = useCatalogFilters()
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')
  const category = filters.data?.categorias.find((item) => normalize(item.nombre).includes(keyword))
  const products = useQuery({
    queryKey: ['home-collection-products', category?.id],
    // La portada exhibe sólo dos fotos. Pedimos cuatro para poder omitir
    // eventualmente un producto sin imagen, sin descargar 24 registros.
    queryFn: () => getProducts({ buscar: '', categoriaId: String(category?.id), subcategoriaId: '', marcaId: '', orden: 'recientes', page: 1, limit: 4 }),
    enabled: Boolean(category),
    staleTime: 60_000,
  })
  const portadas = useQuery({ queryKey: ['portadas-inicio'], queryFn: getPortadasInicio })
  const catalogoParaElegir = useQuery({
    queryKey: ['home-collection-image-picker', category?.id, search, pickerPage],
    queryFn: () => getImagenesCatalogoParaPortada(Number(category?.id), search, pickerPage),
    enabled: Boolean(pickerSlot && category),
    staleTime: 30_000,
  })
  const actualizarPortada = useMutation({
    mutationFn: ({ slotId, file }: { slotId: string; file: File }) => new Promise<{ slotId: string; nombre: string; mediaType: string; contenido: string }>((resolve, reject) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return reject(new Error('Elegí una imagen JPG, PNG o WEBP.'))
      if (file.size > 8 * 1024 * 1024) return reject(new Error('La imagen puede pesar hasta 8 MB.'))
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
      reader.onload = () => resolve({ slotId, nombre: file.name, mediaType: file.type, contenido: String(reader.result).split(',')[1] || '' })
      reader.readAsDataURL(file)
    }).then(({ slotId, nombre, mediaType, contenido }) => updatePortadaInicio(slotId, { nombre, media_type: mediaType, contenido_base64: contenido })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portadas-inicio'] }),
    onSettled: () => setSlotPending(null),
  })
  const usarImagenExistente = useMutation({
    mutationFn: ({ slotId, imageId }: { slotId: string; imageId: number }) => usarImagenProductoEnPortada(slotId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portadas-inicio'] })
      setPickerSlot(null)
    },
    onSettled: () => setSlotPending(null),
  })
  const puedeEditar = user?.rol === 'admin' || user?.rol === 'admin_tecnico'
  const productosConImagen = products.data?.items.filter((product) => product.imagen_url || product.imagenes?.length) || []
  const slots = [1, 2].map((position) => `${imageKey}-${position}`)
  const seleccionarImagen = (slotId: string) => {
    setSlotPending(slotId)
    setSearchInput('')
    setSearch('')
    setPickerPage(1)
    setPickerSlot(slotId)
  }
  const subirDesdePc = () => {
    setPickerSlot(null)
    input.current?.click()
  }
  const slotLabel = pickerSlot?.endsWith('-1') ? 'Foto 1' : 'Foto 2'
  const cargandoSlot = actualizarPortada.isPending || usarImagenExistente.isPending

  return <div className="grid grid-cols-2 items-start gap-3 pb-8 sm:grid-cols-12 sm:gap-5 sm:pb-16">
    {products.isLoading && !slots.some((slot) => portadas.data?.imagenes[slot]) && [0, 1].map((item) => <div key={item} className={`aspect-[3/4] animate-pulse bg-white/40 ${item === 0 ? 'sm:col-span-7 sm:mt-12' : 'sm:col-span-5'}`}/>)}
    {!products.isLoading && slots.map((slotId, index) => <div key={slotId} className={`relative transition duration-500 hover:z-10 hover:-translate-y-2 hover:drop-shadow-2xl ${index === 0 ? 'sm:col-span-7 sm:mt-12' : 'sm:col-span-5 sm:-translate-y-2'}`}><CollectionProductPhoto product={productosConImagen[index]} fallback={provisional[index]} manualImage={portadas.data?.imagenes[slotId]} manualProduct={portadas.data?.productos[slotId]} title={title} slotId={slotId} onChangeImage={seleccionarImagen} uploading={cargandoSlot && slotPending === slotId} canEdit={puedeEditar}/></div>)}
    {puedeEditar && <input ref={input} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; const slotId = slotPending; event.currentTarget.value = ''; if (file && slotId) actualizarPortada.mutate({ slotId, file }) }} />}
    {(actualizarPortada.isError || usarImagenExistente.isError) && <p className="col-span-2 rounded-lg bg-red-50 p-3 text-center text-xs font-semibold text-red-700">{(actualizarPortada.error || usarImagenExistente.error)?.message}</p>}
    {pickerSlot && <div className="fixed inset-0 z-[110] grid place-items-center bg-black/65 p-4" role="dialog" aria-modal="true" aria-label={`Elegir foto para ${title}`} onMouseDown={(event) => { if (event.target === event.currentTarget && !cargandoSlot) setPickerSlot(null) }}>
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-[#f7f7f5] shadow-2xl">
        <header className="flex items-start justify-between border-b border-neutral-200 bg-white px-5 py-4 sm:px-7">
          <div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-neutral-400">Portada de inicio</p><h3 className="mt-1 font-serif text-2xl">{title} · {slotLabel}</h3><p className="mt-1 text-xs text-neutral-500">Elegí una foto existente: se reutiliza la imagen de R2 sin duplicarla.</p></div>
          <button type="button" className="grid size-10 place-items-center rounded-full bg-neutral-100 text-2xl" onClick={() => setPickerSlot(null)} disabled={cargandoSlot} aria-label="Cerrar">×</button>
        </header>
        <form className="flex gap-2 border-b border-neutral-200 px-5 py-3 sm:px-7" onSubmit={(event) => { event.preventDefault(); setSearch(searchInput.trim()) }}>
          <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-700" placeholder={`Buscar foto de ${title.toLowerCase()}`} autoFocus />
          <button type="submit" className="rounded-lg bg-neutral-900 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white" onClick={() => setPickerPage(1)}>Buscar</button>
        </form>
        <div className="overflow-y-auto p-5 sm:p-7">
          {catalogoParaElegir.isLoading && <p className="py-12 text-center text-sm text-neutral-500">Cargando 10 fotos del catálogo…</p>}
          {!catalogoParaElegir.isLoading && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{catalogoParaElegir.data?.items.map((image) => <button key={image.id} type="button" className="group overflow-hidden rounded-lg border border-neutral-200 bg-white text-left transition hover:border-neutral-700 hover:shadow-lg disabled:opacity-60" disabled={cargandoSlot} onClick={() => usarImagenExistente.mutate({ slotId: pickerSlot, imageId: image.id })}><img className="aspect-[3/4] w-full object-cover" src={productImageAsset(image.url, `/api/productos/${image.producto_id}/imagenes/${image.id}`, 480)} alt={image.producto_nombre} loading="lazy" /><span className="block truncate px-2 py-2 text-[9px] font-bold uppercase tracking-wide text-neutral-600">{image.producto_nombre}</span></button>)}</div>}
          {!catalogoParaElegir.isLoading && !catalogoParaElegir.data?.items.length && <p className="py-12 text-center text-sm text-neutral-500">No encontramos fotos para esta búsqueda.</p>}
          {!catalogoParaElegir.isLoading && <div className="mt-5 flex justify-center"><Pagination page={catalogoParaElegir.data?.page || 1} totalPages={catalogoParaElegir.data?.total_paginas || 1} onPageChange={setPickerPage} disabled={cargandoSlot} className="pagination" /></div>}
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-white px-5 py-4 sm:px-7"><p className="text-xs text-neutral-500">¿La foto todavía no está en el catálogo?</p><button type="button" className="rounded-lg border border-neutral-300 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-800" onClick={subirDesdePc} disabled={cargandoSlot}>Subir desde PC</button></footer>
        {usarImagenExistente.isError && <p className="mx-5 mb-4 rounded-lg bg-red-50 p-3 text-center text-xs font-semibold text-red-700">{usarImagenExistente.error.message}</p>}
      </div>
    </div>}
  </div>
}

export function EditorialCollections({ onCategoryNavigate }: { onCategoryNavigate: (category: string) => void }) {
  return <section id="colecciones" className="overflow-hidden bg-white">
    <div className="border-y border-neutral-200 bg-[#faf9f7] px-5 py-4 sm:px-8 lg:px-[7vw]">
      <div className="mx-auto flex max-w-360 flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-[10px] font-bold uppercase tracking-[.16em] text-neutral-700 sm:text-left">
        <span className="size-2 rounded-full bg-[#b28a5a] shadow-[0_0_10px_rgba(178,138,90,.55)]" aria-hidden="true" />
        <span>Comprá directo de fábrica</span>
        <span className="hidden h-3 w-px bg-neutral-300 sm:block" aria-hidden="true" />
        <span className="text-neutral-500">Colecciones y precios pensados para mayoristas</span>
      </div>
    </div>
    {collections.map((collection, index) => {
      const dark = collection.background.includes('text-white')
      return <article key={collection.title} className={`relative overflow-hidden px-5 py-18 sm:px-8 lg:px-[7vw] lg:py-26 ${collection.background}`}>
        <span className={`pointer-events-none absolute -right-3 -top-10 select-none font-serif text-[clamp(7rem,19vw,18rem)] italic leading-none opacity-[.07] ${dark ? 'text-white' : 'text-black'}`}>{collection.title}</span>
        <div className="relative mx-auto max-w-360">
          <div className="mb-12 grid items-end gap-6 border-b border-current/20 pb-7 md:grid-cols-[1fr_auto]">
            <div className="flex items-start gap-5">
              <span className={`pt-2 font-serif text-2xl italic ${collection.muted}`}>{String(index + 1).padStart(2, '0')}</span>
              <div><p className={`text-[9px] font-bold uppercase tracking-[.25em] ${collection.muted}`}>Capítulo de temporada</p><h2 className="mt-2 font-serif text-5xl font-semibold uppercase leading-none sm:text-7xl">{collection.title}</h2></div>
            </div>
            <p className={`max-w-sm text-sm leading-6 md:text-right ${collection.muted}`}>{collection.copy}</p>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[minmax(300px,40%)_minmax(0,60%)] lg:gap-16">
            <div className={collection.reverse ? 'lg:order-2' : ''}><VideoSlot title={collection.title} dark={dark}/></div>
            <div className={collection.reverse ? 'lg:order-1' : ''}>
              <div className="mb-5 flex items-center justify-between"><span className={`text-[9px] font-bold uppercase tracking-[.2em] ${collection.muted}`}>Novedades</span><button type="button" onClick={() => onCategoryNavigate(collection.keyword)} className={`border-b pb-1 text-[9px] font-bold uppercase tracking-[.16em] ${dark ? 'border-white text-white' : 'border-black text-black'}`}>Ver colección completa →</button></div>
              <CollectionProducts keyword={collection.keyword} imageKey={collection.imageKey} provisional={collection.provisional} title={collection.title}/>
            </div>
          </div>
        </div>
      </article>
    })}
  </section>
}
