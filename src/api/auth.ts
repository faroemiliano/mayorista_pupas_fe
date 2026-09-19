import { apiGet, apiPatch, apiPost } from './client'
import type { AuthUser } from '../types/auth'
export type AuthResult={access_token:string;token_type:string;usuario:AuthUser}
export type RegisterResult={mensaje:string;estado:string}
export const login = (email:string,password:string) => apiPost<AuthResult>('/api/auth/login',{email,password})
export const register = (data:{nombre:string;email:string;telefono:string;provincia:string;localidad_partido:string;domicilio:string;canal_venta:string;tienda_online_url:string|null;password:string;confirmar_password:string}) => apiPost<RegisterResult>('/api/auth/registro',data)
export const getCurrentUser = () => apiGet<AuthUser>('/api/auth/me')
export const updateProfile = (data:{nombre:string;telefono:string;documento:string|null;provincia:string|null;localidad_partido:string|null;domicilio:string|null;canal_venta:string|null;tienda_online_url:string|null;acepta_promociones_email:boolean}) => apiPatch<AuthUser>('/api/auth/me',data)
