import { createContext, useContext, useEffect, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react'
import { checkEmailMigration, getCurrentUser, login, register, requestPasswordReset } from '../api/auth'
import type { AuthUser } from '../types/auth'
import { Link } from 'react-router-dom'

const PROVINCIAS = ['Buenos Aires','Ciudad Autónoma de Buenos Aires','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán']

const KEY = 'pupas-auth-token'
const WELCOME_KEY = 'pupas-welcome-seen'
const Context = createContext<{user:AuthUser|null;loading:boolean;logout:()=>void;refreshUser:()=>Promise<void>}|null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser|null>(null)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(KEY)))
  useEffect(() => {
    if (!localStorage.getItem(KEY)) return
    let cancelado = false
    const restaurarSesion = async (intento = 0): Promise<void> => {
      try {
        const sesion = await getCurrentUser()
        if (!cancelado) setUser(sesion)
      } catch (error) {
        const sesionInvalida = error instanceof Error && error.message.includes('(401)')
        if (sesionInvalida) {
          localStorage.removeItem(KEY)
        } else if (intento < 2) {
          window.setTimeout(() => { void restaurarSesion(intento + 1) }, 1500)
          return
        }
      }
      if (!cancelado) setLoading(false)
    }
    void restaurarSesion()
    return () => { cancelado = true }
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
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [emailMigrated,setEmailMigrated]=useState(false)
  const [checkingEmail,setCheckingEmail]=useState(false)
  const [resetSent,setResetSent]=useState(false)
  const [resetNotice,setResetNotice]=useState('')
  const [sendingReset,setSendingReset]=useState(false)

  useEffect(() => {
    // No mostramos el modal hasta terminar de restaurar el token al refrescar.
    // Si existe una sesión válida, el modal siempre queda cerrado.
    if (loading) return
    if (user) {
      setOpen(false)
      return
    }
    if (!sessionStorage.getItem(WELCOME_KEY)) setOpen(true)
  }, [user, loading])

  const closeModal = () => {
    sessionStorage.setItem(WELCOME_KEY, 'true')
    setOpen(false)
  }

  if (user) return <Link className="group flex shrink-0 items-center gap-2 border-l border-neutral-200 px-2 py-1 text-neutral-900 no-underline transition hover:text-neutral-500 sm:px-3" to="/mi-cuenta" aria-label="Ir a Mi cuenta"><svg className="size-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path strokeLinecap="round" d="M5.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6"/></svg><span className="hidden flex-col sm:flex"><small className="text-[8px] font-bold uppercase tracking-[.16em] text-neutral-500">Mi cuenta</small><strong className="max-w-28 truncate text-[10px] font-semibold uppercase tracking-wide">{user.nombre}</strong></span></Link>

  const revisarEmail = async (valor:string) => {
    if (!valor.includes('@')) { setEmailMigrated(false); return }
    setCheckingEmail(true)
    try {
      const migrada = (await checkEmailMigration(valor)).requiere_migracion
      setEmailMigrated(migrada)
    } catch { setEmailMigrated(false) } finally { setCheckingEmail(false) }
  }

  const revisarAlEntrarEnPassword = (event: React.FocusEvent<HTMLInputElement>) => {
    const email = String((event.currentTarget.form?.elements.namedItem('email') as HTMLInputElement)?.value || '')
    void revisarEmail(email)
  }

  const enviarEnlace = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); setError(''); setResetNotice('')
    const email = String((event.currentTarget.form?.elements.namedItem('email') as HTMLInputElement)?.value || '')
    if (!email.includes('@')) { setError('Ingresá primero tu email.'); return }
    setSendingReset(true)
    try {
      await requestPasswordReset(email)
      setResetSent(true)
      setResetNotice('Si la dirección corresponde a una cuenta activa, te enviamos un email para crear o restablecer tu contraseña. Revisá también Spam o Correo no deseado.')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo enviar el enlace.') } finally { setSendingReset(false) }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('')
    const data = new FormData(event.currentTarget)
    const password = String(data.get('password'))
    const confirmation = String(data.get('confirmar_password'))
    if (mode === 'login' && emailMigrated) { setError('Enviá el email para crear tu contraseña y continuá desde el enlace recibido.'); return }
    if (mode === 'register' && password !== confirmation) { setError('Las contraseñas no coinciden.'); return }
    try {
      if (mode === 'login') {
        const result = await login(String(data.get('email')), password)
        localStorage.setItem(KEY, result.access_token); window.location.reload()
      } else {
        const tiendaOnline = String(data.get('tienda_online_url') || '').trim()
        const result = await register({nombre:String(data.get('nombre')),apellido:String(data.get('apellido')),email:String(data.get('email')),telefono:String(data.get('telefono')),provincia:String(data.get('provincia')),localidad_partido:String(data.get('localidad_partido')),domicilio:null,canal_venta:String(data.get('canal_venta')),tienda_online_url:tiendaOnline||null,password,confirmar_password:confirmation})
        setSuccess(result.mensaje)
      }
    } catch (reason) { const message=reason instanceof Error?reason.message:'No se pudo continuar.';if(mode==='login'&&message==='MIGRACION_PASSWORD_REQUERIDA'){setEmailMigrated(true);setError('')}else setError(message) }
  }

  const field = 'w-full rounded-xl border border-neutral-300 bg-[#fafafa] px-4 py-3 text-sm outline-none transition focus:border-[#404040] focus:ring-4 focus:ring-neutral-200'
  return <>
    <button className="shrink-0 border border-black bg-black px-4 py-2.5 text-[9px] font-bold uppercase tracking-[.14em] text-white transition hover:bg-white hover:text-black" onClick={()=>setOpen(true)}>Ingresar</button>
    {open && <div className="fixed inset-0 z-[100] grid place-items-center bg-[#171717]/70 p-4 backdrop-blur-sm" onMouseDown={closeModal}>
      <form className="relative max-h-[94vh] w-full max-w-[560px] overflow-y-auto rounded-3xl bg-white shadow-2xl" onSubmit={submit} onMouseDown={event=>event.stopPropagation()}>
        <div className="bg-black px-8 py-7 text-white"><button className="absolute right-5 top-4 text-3xl text-white/80" type="button" aria-label="Cerrar bienvenida" onClick={closeModal}>×</button><img className="h-14 w-44 object-contain invert" src="/brand/logo-pupas.jpg" alt="Pupas"/><h2 className="mt-3 font-serif text-3xl font-semibold">Bienvenidos a Pupas</h2><p className="mt-2 text-sm text-white/70">Ingresá o creá tu cuenta para acceder a precios y compras mayoristas. También podés cerrar esta ventana y recorrer la tienda.</p></div>
        <div className="space-y-4 px-8 py-7">
          {success ? <><div className="rounded-2xl bg-emerald-50 p-5 text-center"><div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-emerald-600 text-2xl text-white">✓</div><h3 className="font-bold text-emerald-900">Registro enviado</h3><p className="mt-2 text-sm text-emerald-800">{success}</p></div><button className="w-full rounded-xl bg-[#111111] p-3 text-white" type="button" onClick={()=>{setSuccess('');setMode('login')}}>Ir a iniciar sesión</button></> : <>
          <div className="grid grid-cols-2 border border-neutral-200 p-1"><button type="button" className={`px-4 py-3 text-xs font-extrabold uppercase tracking-wider ${mode==='login'?'bg-black text-white':'bg-white text-neutral-500'}`} onClick={()=>{setMode('login');setEmailMigrated(false);setResetSent(false);setError('')}}>Ingresar</button><button type="button" className={`px-4 py-3 text-xs font-extrabold uppercase tracking-wider ${mode==='register'?'bg-black text-white':'bg-white text-neutral-500'}`} onClick={()=>{setMode('register');setEmailMigrated(false);setResetSent(false);setError('')}}>Registrarme</button></div>
          {mode==='register' && <><div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs font-bold text-[#262626]">Nombre<input className={`${field} mt-1.5`} required minLength={2} name="nombre" placeholder="Tu nombre"/></label><label className="block text-xs font-bold text-[#262626]">Apellido<input className={`${field} mt-1.5`} required minLength={1} name="apellido" placeholder="Tu apellido"/></label></div><label className="block text-xs font-bold text-[#262626]">Teléfono<input className={`${field} mt-1.5`} required minLength={6} name="telefono" type="tel" placeholder="Ej: 341 555 1234"/></label></>}
          <label className="block text-xs font-bold text-[#262626]">Dirección de correo electrónico<input className={`${field} mt-1.5`} required type="email" name="email" autoComplete="email" placeholder="nombre@correo.com" onChange={()=>{setEmailMigrated(false);setResetSent(false);setResetNotice('')}} onBlur={event=>{void revisarEmail(event.target.value)}}/></label>
          {emailMigrated&&mode==='login'&&<div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong className="block">Reconocimos tu cuenta anterior de Pupas</strong><span className="mt-1 block">Por seguridad, tenés que crear una nueva contraseña. Te enviaremos un enlace a este correo y todo el proceso continuará desde allí.</span>{resetSent?<><p className="mt-3 rounded-xl bg-white p-3 text-xs font-bold text-emerald-800">Email enviado. Revisá también las carpetas Spam o Correo no deseado.</p><button type="button" className="mt-3 w-full rounded-xl border border-amber-700 bg-white px-4 py-3 text-xs font-bold text-amber-900 disabled:opacity-60" disabled={sendingReset} onClick={enviarEnlace}>{sendingReset?'Reenviando email…':'No lo recibí · reenviar email'}</button><small className="mt-2 block text-center text-xs text-amber-800">Si reenviás el email, usá el enlace más reciente.</small></>:<button type="button" className="mt-4 w-full rounded-xl bg-black px-4 py-3 text-xs font-bold text-white disabled:opacity-60" disabled={sendingReset} onClick={enviarEnlace}>{sendingReset?'Enviando email…':'Enviar email para crear mi contraseña'}</button>}</div>}
          {mode==='login'&&!emailMigrated&&<label className="block text-xs font-bold text-[#262626]">Contraseña<input className={`${field} mt-1.5`} required minLength={8} type="password" name="password" autoComplete="current-password" placeholder={checkingEmail?'Comprobando tu email…':'Mínimo 8 caracteres'} onFocus={revisarAlEntrarEnPassword}/>{checkingEmail&&<small className="mt-1.5 block font-normal text-neutral-500">Comprobando si tu cuenta fue migrada…</small>}</label>}
          {mode==='register' && <><label className="block text-xs font-bold text-[#262626]">Contraseña<input className={`${field} mt-1.5`} required minLength={8} maxLength={128} type="password" name="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres"/><small className="mt-1.5 block font-normal text-neutral-500">Usá al menos 8 caracteres.</small></label><label className="block text-xs font-bold text-[#262626]">Repetir contraseña<input className={`${field} mt-1.5`} required minLength={8} maxLength={128} type="password" name="confirmar_password" autoComplete="new-password" placeholder="Repetí tu contraseña"/></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs font-bold text-[#262626]">Provincia<select className={`${field} mt-1.5`} required name="provincia" defaultValue=""><option value="" disabled>Seleccioná una provincia</option>{PROVINCIAS.map(provincia=><option key={provincia}>{provincia}</option>)}</select></label><label className="block text-xs font-bold text-[#262626]">Localidad / Partido<input className={`${field} mt-1.5`} required minLength={2} name="localidad_partido" placeholder="Ej: Rosario"/></label></div><fieldset className="rounded-2xl border border-neutral-200 bg-[#fafafa] p-4"><legend className="px-2 text-xs font-extrabold text-[#262626]">Canales de venta</legend><div className="mt-1 grid gap-2 sm:grid-cols-3">{[['local_fisico','Local físico'],['tienda_online','Tienda online'],['ambos','Local físico y tienda online']].map(([value,label])=><label key={value} className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3 text-xs font-semibold"><input required type="radio" name="canal_venta" value={value} className="accent-[#111111]"/>{label}</label>)}</div></fieldset><label className="block text-xs font-bold text-[#262626]">Link de tu tienda online <span className="font-normal text-gray-400">(opcional)</span><input className={`${field} mt-1.5`} type="url" name="tienda_online_url" placeholder="https://mitienda.com o Instagram"/></label></>}
          {error && <p className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">{error}</p>}
          {mode==='login' && !emailMigrated && <><button type="button" className="w-full text-xs font-semibold text-neutral-600 underline disabled:cursor-wait disabled:opacity-60" disabled={sendingReset} onClick={enviarEnlace}>{sendingReset?'Enviando email…':'Olvidé mi contraseña'}</button>{resetNotice&&<p className="rounded-lg bg-emerald-50 p-3 text-center text-xs font-medium text-emerald-800">{resetNotice}</p>}</>}
          {(!emailMigrated || mode==='register') && <button className="w-full rounded-xl bg-[#111111] p-3.5 text-sm font-extrabold text-white transition hover:bg-[#262626]">{mode==='login'?'Ingresar a mi cuenta':'Crear mi cuenta'}</button>}
          </>}
        </div>
      </form>
    </div>}
  </>
}
