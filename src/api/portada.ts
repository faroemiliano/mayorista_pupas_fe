import { apiGet, apiPost, apiPut } from './client'

export type PortadasInicio = {
  imagenes: Record<string, string>
  productos: Record<string, { id: number; slug: string }>
}

export type PortadaActualizada = {
  slide_id: string
  imagen_url: string
}

export type CargaVideoPortada = {
  clave: string
  upload_url: string
  video_url: string
}

export type ImagenCatalogoPortada = {
  id: number
  url: string
  producto_id: number
  producto_nombre: string
  producto_slug: string
}

export type ImagenesCatalogoPortadaPage = {
  items: ImagenCatalogoPortada[]
  total: number
  page: number
  limit: number
  total_paginas: number
}

export const getPortadasInicio = () => apiGet<PortadasInicio>('/api/portada')

export const updatePortadaInicio = (
  slideId: string,
  data: { nombre: string; media_type: string; contenido_base64: string },
) => apiPut<PortadaActualizada>(`/api/admin/portada/${slideId}`, data)

export const usarImagenProductoEnPortada = (slideId: string, imagenId: number) =>
  apiPut<PortadaActualizada>(`/api/admin/portada/${slideId}/imagen-producto`, {
    imagen_id: imagenId,
  })

export const getImagenesCatalogoParaPortada = (
  categoriaId: number,
  buscar: string,
  page: number,
) => {
  const params = new URLSearchParams({ categoria_id: String(categoriaId), page: String(page), limit: '10' })
  if (buscar) params.set('buscar', buscar)
  return apiGet<ImagenesCatalogoPortadaPage>(`/api/admin/portada/imagenes-producto?${params}`)
}

export const prepararCargaVideoPortada = (videoId: string, file: File) =>
  apiPost<CargaVideoPortada>(`/api/admin/portada/${videoId}/video/carga`, {
    nombre: file.name,
    media_type: file.type,
    tamano: file.size,
  })

export const confirmarCargaVideoPortada = (videoId: string, clave: string) =>
  apiPut<PortadaActualizada>(`/api/admin/portada/${videoId}/video/confirmar`, { clave })
