export type ReviewStatus = 'pendiente' | 'aprobada' | 'rechazada'

export type CustomerReview = {
  id: number
  calificacion: number
  comentario: string
  estado: ReviewStatus
  destacada: boolean
  creada_en: string
  nombre: string | null
  apellido: string | null
  cliente_nombre: string | null
  cliente_email: string | null
}
