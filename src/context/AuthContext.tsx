import { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { getCurrentUser, login, register } from '../api/auth'
import type { AuthUser } from '../types/auth'

const KEY = 'pupas-auth-token'
const Context = createContext<{user:AuthUser|null;loading:boolean;logout:()=>void;refreshUser:()=>Promise<void>}|null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser|null>(null)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(KEY)))
  useEffect(() => {
    if (!localStorage.getItem(KEY)) return
    getCurrentUser().then(setUser).catch(() => localStorage.removeItem(KEY)).finally(() => setLoading(false))
  }, [])
  const refreshUser = async () => { setUser(await getCurrentUser()) }
  return <Context.Provider value={{user,loading,logout:()=>{localStorage.removeItem(KEY);setUser(null)},refreshUser}}>{children}</Context.Provider>
}

export function useAuth() {
  const context = useContext(Context)
  if (!context) throw new Error('AuthProvider faltante')
  return context
}

export function GoogleAccessButton() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (user) return <div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-full bg-rose-100 font-extrabold text-[#722f55]">{user.nombre.charAt(0).toUpperCase()}</div><span className="hidden flex-col lg:flex"><small className="text-[9px] uppercase text-gray-500">{user.rol==='admin'?'Administrador':'Cliente'}</small><strong className="max-w-28 truncate text-xs">{user.nombre}</strong></span><button className="text-xs font-bold text-[#722f55]" type="button" onClick={logout}>Salir</button></div>

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('')
    const data = new FormData(event.currentTarget)
    const password = String(data.get('password'))
    const confirmation = String(data.get('confirmar_password'))
    if (mode === 'register' && password !== confirmation) { setError('Las contraseñas no coinciden.'); return }
    try {
      if (mode === 'login') {
        const result = await login(String(data.get('email')), password)
        localStorage.setItem(KEY, result.access_token); window.location.reload()
      } else {
        const documento = String(data.get('documento') || '').replace(/\D/g, '')
        const result = await register({nombre:String(data.get('nombre')),email:String(data.get('email')),telefono:String(data.get('telefono')),documento:documento || null,password,confirmar_password:confirmation})
        setSuccess(result.mensaje)
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo continuar.') }
  }

  const field = 'w-full rounded-xl border border-rose-200 bg-[#fffafb] px-4 py-3 text-sm outline-none transition focus:border-[#a95078] focus:ring-4 focus:ring-rose-100'
  return <>
    <button className="shrink-0 rounded-full bg-[#722f55] px-5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#5c2344]" onClick={()=>setOpen(true)}>Ingresar</button>
    {open && <div className="fixed inset-0 z-[100] grid place-items-center bg-[#26131f]/70 p-4 backdrop-blur-sm" onMouseDown={()=>setOpen(false)}>
      <form className="relative w-full max-w-[460px] overflow-hidden rounded-3xl bg-white shadow-2xl" onSubmit={submit} onMouseDown={event=>event.stopPropagation()}>
        <div className="bg-gradient-to-br from-[#722f55] to-[#a84e75] px-8 py-7 text-white"><button className="absolute right-5 top-4 text-3xl text-white/80" type="button" onClick={()=>setOpen(false)}>×</button><p className="text-[10px] font-extrabold tracking-[3px] text-rose-100">PUPAS MAYORISTA</p><h2 className="mt-2 text-3xl font-bold">{mode==='login'?'¡Qué bueno verte!':'Creá tu cuenta'}</h2><p className="mt-2 text-sm text-rose-100">{mode==='login'?'Ingresá para ver precios y realizar pedidos.':'Registrate para acceder al catálogo mayorista.'}</p></div>
        <div className="space-y-4 px-8 py-7">
          {success ? <><div className="rounded-2xl bg-emerald-50 p-5 text-center"><div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-emerald-600 text-2xl text-white">✓</div><h3 className="font-bold text-emerald-900">Registro enviado</h3><p className="mt-2 text-sm text-emerald-800">{success}</p></div><button className="w-full rounded-xl bg-[#722f55] p-3 text-white" type="button" onClick={()=>{setSuccess('');setMode('login')}}>Ir a iniciar sesión</button></> : <>
          {mode==='register' && <><label className="block text-xs font-bold text-[#553647]">Nombre<input className={`${field} mt-1.5`} required minLength={2} name="nombre" placeholder="Tu nombre"/></label><label className="block text-xs font-bold text-[#553647]">Teléfono<input className={`${field} mt-1.5`} required minLength={6} name="telefono" type="tel" placeholder="Ej: 341 555 1234"/></label><label className="block text-xs font-bold text-[#553647]">DNI o CUIT <span className="font-normal text-gray-400">(opcional)</span><input className={`${field} mt-1.5`} inputMode="numeric" name="documento" pattern="[0-9]{7,11}" placeholder="Sólo números"/><span className="mt-1 block text-[10px] font-normal text-gray-400">Nos ayuda a identificarte si ya sos cliente en Dux.</span></label></>}
          <label className="block text-xs font-bold text-[#553647]">Email<input className={`${field} mt-1.5`} required type="email" name="email" placeholder="nombre@correo.com"/></label>
          <label className="block text-xs font-bold text-[#553647]">Contraseña<input className={`${field} mt-1.5`} required minLength={8} type="password" name="password" placeholder="Mínimo 8 caracteres"/></label>
          {mode==='register' && <label className="block text-xs font-bold text-[#553647]">Confirmar contraseña<input className={`${field} mt-1.5`} required minLength={8} type="password" name="confirmar_password" placeholder="Repetí tu contraseña"/></label>}
          {error && <p className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">{error}</p>}
          <button className="w-full rounded-xl bg-[#722f55] p-3.5 text-sm font-extrabold text-white transition hover:bg-[#5c2344]">{mode==='login'?'Ingresar a mi cuenta':'Crear mi cuenta'}</button>
          <button className="w-full text-sm font-bold text-[#8d3c67]" type="button" onClick={()=>{setMode(mode==='login'?'register':'login');setError('')}}>{mode==='login'?'¿No tenés cuenta? Registrate':'¿Ya tenés cuenta? Ingresá'}</button></>}
        </div>
      </form>
    </div>}
  </>
}
