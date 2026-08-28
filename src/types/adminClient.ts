export type DuxClientItem = {
  id_cliente: number
  codigo: string | null
  nombre: string
  email: string | null
  telefono: string | null
  tipo_doc: string | null
  nro_doc: string | null
  cuit_cuil: string | null
  localidad: string | null
  provincia: string | null
  habilitado: boolean
  fecha_creacion: string | null
  usuario_id: number | null
  usuario_estado: string | null
  criterio_vinculacion: 'id_dux' | 'documento' | 'email' | null
}

export type DuxClientPage = {
  items: DuxClientItem[]
  total: number
  pagina: number
  limite: number
  hay_mas: boolean
  ultima_sincronizacion: string | null
}

export type DuxClientTotal = { total: number; cache_segundos: number }

export type DuxClientSyncResult = {
  procesados: number
  creados: number
  actualizados: number
  total_local: number
  sincronizado_en: string
}

export type DuxClientSyncStatus = {
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'error'
  procesados: number
  creados: number
  actualizados: number
  total_local: number
  error: string | null
  iniciada_en: string | null
  finalizada_en: string | null
}
