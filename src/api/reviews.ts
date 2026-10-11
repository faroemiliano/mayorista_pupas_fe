import { apiGet, apiPatch, apiPost } from './client'
import type { CustomerReview, ReviewStatus } from '../types/review'

export const getPublicReviews = () => apiGet<CustomerReview[]>('/api/resenas/publicas')
export const getMyReview = () => apiGet<CustomerReview | null>('/api/resenas/mia')
export const saveMyReview = (data: { calificacion: number; comentario: string; nombre?: string; apellido?: string }) => apiPost<CustomerReview>('/api/resenas/mia', data)
export const getAdminReviews = (status?: ReviewStatus) => apiGet<CustomerReview[]>(`/api/resenas/admin${status ? `?estado=${status}` : ''}`)
export const moderateReview = (id: number, data: { estado?: ReviewStatus; destacada?: boolean }) => apiPatch<CustomerReview>(`/api/resenas/admin/${id}`, data)
