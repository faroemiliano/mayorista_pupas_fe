export type UserRole = 'cliente' | 'admin'
export type AuthUser = { id:number; email:string; nombre:string; apellido:string; telefono:string|null; documento:string|null; avatar_url:string|null; rol:UserRole; email_verificado:boolean; estado_registro:'pendiente'|'aprobado'|'rechazado'; creado_en:string }
