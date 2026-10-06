import { apiGet, apiPatch, apiPost } from './client'
import type { AuthUser } from '../types/auth'
export type AuthResult={access_token:string;token_type:string;usuario:AuthUser}
export type RegisterResult={mensaje:string;estado:string}
export const login = (email:string,password:string) => apiPost<AuthResult>('/api/auth/login',{email,password})
export const checkEmailMigration = (email:string) => apiPost<{requiere_migracion:boolean}>('/api/auth/estado-email',{email})
export const register = (data:{nombre:string;apellido:string;email:string;telefono:string;provincia:string;localidad_partido:string;domicilio:string;canal_venta:string;tienda_online_url:string|null;password:string;confirmar_password:string}) => apiPost<RegisterResult>('/api/auth/registro',data)
export const getCurrentUser = () => apiGet<AuthUser>('/api/auth/me')
export const updateProfile = (data:{nombre:string;telefono:string;documento:string|null;provincia:string|null;localidad_partido:string|null;domicilio:string|null;canal_venta:string|null;tienda_online_url:string|null;acepta_promociones_email:boolean}) => apiPatch<AuthUser>('/api/auth/me',data)
export const changePassword = (data:{password_actual:string;password_nueva:string;confirmar_password:string}) => apiPatch<{mensaje:string}>('/api/auth/me/password',data)
export const requestPasswordReset = (email:string) => apiPost<{mensaje:string}>('/api/auth/solicitar-reset-password',{email})
export const resetPassword = (token:string,password:string,confirmar_password:string) => apiPost<{mensaje:string}>('/api/auth/restablecer-password',{token,password,confirmar_password})
export const completePasswordMigration = (data:{email:string;password_anterior:string;password_nueva:string;confirmar_password:string}) => apiPost<AuthResult>('/api/auth/completar-migracion-password',data)
