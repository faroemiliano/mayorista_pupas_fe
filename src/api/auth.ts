import { apiGet, apiPatch, apiPost } from './client'
import type { AuthUser } from '../types/auth'
export type AuthResult={access_token:string;token_type:string;usuario:AuthUser}
export type RegisterResult={mensaje:string;estado:string}
export const login = (email:string,password:string) => apiPost<AuthResult>('/api/auth/login',{email,password})
export const register = (data:{nombre:string;email:string;telefono:string;documento:string|null;password:string;confirmar_password:string}) => apiPost<RegisterResult>('/api/auth/registro',data)
export const getCurrentUser = () => apiGet<AuthUser>('/api/auth/me')
export const updateProfile = (data:{nombre:string;telefono:string;documento:string|null}) => apiPatch<AuthUser>('/api/auth/me',data)
