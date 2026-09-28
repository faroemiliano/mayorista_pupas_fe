import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/auth'

export function ResetPassword(){
  const [params]=useSearchParams();const token=params.get('token')||''
  const [message,setMessage]=useState('');const [error,setError]=useState('')
  const submit=async(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();setError('');const form=new FormData(e.currentTarget);const password=String(form.get('password'));const confirmation=String(form.get('confirmation'));if(password!==confirmation){setError('Las contraseñas no coinciden.');return}try{const result=await resetPassword(token,password,confirmation);setMessage(result.mensaje)}catch(reason){setError(reason instanceof Error?reason.message:'No se pudo actualizar.') }}
  return <main className="grid min-h-screen place-items-center bg-neutral-100 p-5"><section className="w-full max-w-md bg-white p-8"><h1 className="font-serif text-3xl font-semibold">Crear nueva contraseña</h1>{message?<><p className="mt-5 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p><Link className="mt-5 block bg-black p-3 text-center text-white" to="/">Ir a iniciar sesión</Link></>:<form className="mt-6 space-y-4" onSubmit={submit}><input className="w-full border p-3" type="password" name="password" minLength={8} required placeholder="Nueva contraseña"/><input className="w-full border p-3" type="password" name="confirmation" minLength={8} required placeholder="Repetir contraseña"/>{error&&<p className="bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button className="w-full bg-black p-3 text-white" disabled={!token}>Guardar contraseña</button></form>}</section></main>
}
