import { apiGet,apiPatch,apiPost } from './client'
import type { Notification,NotificationCampaign,NotificationCampaignResult,NotificationList } from '../types/notification'
export const getAdminNotifications=()=>apiGet<NotificationList>('/api/notificaciones/admin')
export const getMyNotifications=()=>apiGet<NotificationList>('/api/notificaciones/mias')
export const readNotification=(id:number)=>apiPatch<Notification>(`/api/notificaciones/${id}/leer`,{})
export const getPublicConfiguration=()=>apiGet<{whatsapp_empresa:string|null}>('/api/configuracion/publica')
export const createNotificationCampaign=(data:NotificationCampaign)=>apiPost<NotificationCampaignResult>('/api/notificaciones/admin/campanas',data)
