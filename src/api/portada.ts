import { apiGet, apiPut } from './client'

export type PortadasInicio = {
  imagenes: Record<string, string>
  productos: Record<string, { id: number; slug: string }>
}

export type PortadaActualizada = {
  slide_id: string
  imagen_url: string
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
