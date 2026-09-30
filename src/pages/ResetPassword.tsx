import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/auth'

export function ResetPassword(){
  const [params]=useSearchParams();const token=params.get('token')||''
  const [message,setMessage]=useState('');const [error,setError]=useState('');const [submitting,setSubmitting]=useState(false)
  const submit=async(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();setError('');const form=new FormData(e.currentTarget);const password=String(form.get('password'));const confirmation=String(form.get('confirmation'));if(password!==confirmation){setError('Las contraseñas no coinciden.');return}setSubmitting(true);try{const result=await resetPassword(token,password,confirmation);setMessage(result.mensaje)}catch(reason){setError(reason instanceof Error?reason.message:'No se pudo actualizar la contraseña.')}finally{setSubmitting(false)}}
  const field='mt-2 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-sm outline-none transition focus:border-neutral-700 focus:bg-white focus:ring-4 focus:ring-neutral-200'
  return <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f5f1ed] px-5 py-10">
    <div className="absolute -left-28 -top-28 size-80 rounded-full bg-[#ddcfc3]/50 blur-3xl" aria-hidden="true"/>
    <div className="absolute -bottom-36 -right-24 size-96 rounded-full bg-[#e7d9cf]/70 blur-3xl" aria-hidden="true"/>
    <section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#e4d9d0] bg-white shadow-[0_24px_80px_rgba(57,43,32,0.14)]">
      <header className="border-b border-neutral-100 px-8 pb-7 pt-8 text-center">
        <Link to="/" aria-label="Volver a Pupas"><img className="mx-auto h-20 w-56 object-contain" src="/brand/logo-pupas.jpg" alt="Pupas"/></Link>
        <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[.28em] text-[#756351]">Tienda mayorista</p>
      </header>
      <div className="px-7 py-8 sm:px-9">
        {message?<div className="text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-2xl text-emerald-700" aria-hidden="true">✓</span><h1 className="mt-5 font-serif text-3xl font-semibold text-neutral-900">Tu contraseña ya está lista</h1><p className="mt-3 text-sm leading-6 text-neutral-600">{message} Ya podés ingresar a tu cuenta mayorista.</p><Link className="mt-7 block rounded-xl bg-black px-5 py-3.5 text-center text-sm font-bold text-white no-underline transition hover:bg-neutral-800" to="/">Ir a iniciar sesión</Link></div>:<>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#8a7463]">Seguridad de tu cuenta</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-neutral-900">Creá tu nueva contraseña</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Elegí una clave de al menos 8 caracteres para volver a ingresar a Pupas Mayorista.</p>
          {!token?<div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong className="block">El enlace no es válido</strong>Solicitá un nuevo email desde la pantalla de ingreso.</div>:<form className="mt-7 space-y-5" onSubmit={submit}>
            <label className="block text-xs font-bold text-neutral-800">Nueva contraseña<input className={field} type="password" name="password" minLength={8} maxLength={128} required autoComplete="new-password" placeholder="Mínimo 8 caracteres"/></label>
            <label className="block text-xs font-bold text-neutral-800">Repetir nueva contraseña<input className={field} type="password" name="confirmation" minLength={8} maxLength={128} required autoComplete="new-password" placeholder="Volvé a escribirla"/></label>
            {error&&<p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700">{error}</p>}
            <button className="w-full rounded-xl bg-black px-5 py-3.5 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting}>{submitting?'Guardando…':'Guardar nueva contraseña'}</button>
          </form>}
          <p className="mt-6 text-center text-xs leading-5 text-neutral-400">Por seguridad, el enlace del email vence en una hora y solo puede utilizarse una vez.</p>
        </>}
      </div>
    </section>
  </main>
}
