import { apiDelete, apiGet, apiGetBlob, apiPost } from './client'

export type ClientMaterial = {
  id: number
  titulo: string
  descripcion: string | null
  nombre_archivo: string
  tipo_contenido: string
  creado_en: string
}

export type CreateClientMaterial = {
  titulo: string
  descripcion: string | null
  nombre_archivo: string
  contenido_base64: string
}

export const getClientMaterials = () => apiGet<ClientMaterial[]>('/api/materiales-clientes/')
export const getAdminClientMaterials = () => apiGet<ClientMaterial[]>('/api/admin/materiales-clientes/')
export const createClientMaterial = (data: CreateClientMaterial) => apiPost<ClientMaterial>('/api/admin/materiales-clientes/', data)
export const createClientMaterials = (data: { titulo: string; descripcion: string | null; archivos: Array<{ nombre_archivo: string; contenido_base64: string }> }) => apiPost<ClientMaterial[]>('/api/admin/materiales-clientes/lote', data)
export const deleteClientMaterial = (id: number) => apiDelete(`/api/admin/materiales-clientes/${id}`)
export const getClientMaterialFile = (id: number) => apiGetBlob(`/api/materiales-clientes/${id}/archivo`)

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    reader.readAsDataURL(file)
  })
}
