import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Brand } from './Brand'
import { useCart } from '../../context/CartContext'
import { GoogleAccessButton, useAuth } from '../../context/AuthContext'
import { getAdminNotifications, getMyNotifications } from '../../api/notifications'

type Props = { search: string; onSearchChange: (value: string) => void; onSearch: () => void; onCategoryNavigate: (category: string) => void }

const navItems = [
  ['Bikinis', 'bikini'],
  ['Pijamas', 'pijama'],
]

export function Header({ search, onSearchChange, onSearch, onCategoryNavigate }: Props) {
  const cart = useCart()
  const { user } = useAuth()
  const notifications = useQuery({
    queryKey: [user?.rol === 'admin' ? 'admin-notifications' : 'my-notifications'],
    queryFn: user?.rol === 'admin' ? getAdminNotifications : getMyNotifications,
    enabled: Boolean(user),
    refetchInterval: 30_000,
  })
  const unread = notifications.data?.no_leidas ?? 0

  return <header className="!sticky !top-8 !z-40 !block !border-b !border-neutral-200 !bg-white !p-0">
    <div className="relative mx-auto flex min-h-18 max-w-360 items-center justify-between px-4 sm:px-7 lg:px-[5vw]">
      <div className="hidden w-40 items-center gap-4 text-neutral-800 md:flex">
        <a href="#" className="grid size-9 place-items-center text-current no-underline transition hover:opacity-50" aria-label="Facebook">
          <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M13.6 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.4v3h2.8v8h3.4Z"/></svg>
        </a>
        <a href="#" className="grid size-9 place-items-center text-current no-underline transition hover:opacity-50" aria-label="Instagram">
          <svg className="size-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.8" r=".8" fill="currentColor" stroke="none"/></svg>
        </a>
      </div>
      <div className="absolute -left-2 md:left-1/2 md:-translate-x-1/2"><Brand/></div>
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {user?.rol === 'admin' && <Link className="grid size-9 shrink-0 place-items-center border border-neutral-200 text-neutral-800 no-underline transition hover:border-black sm:flex sm:h-9 sm:w-auto sm:gap-2 sm:px-3" to="/admin" aria-label="Ir al panel de administración"><span className="text-base sm:text-sm" aria-hidden="true">⚙</span><span className="hidden text-[9px] font-bold uppercase tracking-wider sm:inline">Panel admin</span></Link>}
        <GoogleAccessButton/>
        {user && <Link to={user.rol === 'admin' ? '/admin/notificaciones' : '/mi-cuenta?seccion=notificaciones'} className="relative grid size-9 place-items-center text-neutral-800 no-underline" aria-label="Notificaciones">♢{unread > 0 && <b className="absolute right-0 top-0 grid min-h-4 min-w-4 place-items-center rounded-full bg-black px-1 text-[8px] text-white">{unread > 99 ? '99+' : unread}</b>}</Link>}
        <button type="button" onClick={cart.openCart} className="relative grid size-9 place-items-center bg-transparent text-neutral-900 transition hover:text-neutral-500" aria-label="Abrir carrito"><svg className="size-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5.5 8.5h13l-1 11h-11l-1-11Z"/><path strokeLinecap="round" d="M9 9V6.5a3 3 0 0 1 6 0V9"/></svg>{cart.totalUnits > 0 && <b className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-black px-1 text-[8px] leading-none text-white">{cart.totalUnits}</b>}</button>
      </div>
    </div>
    <div className="border-t border-neutral-100">
      <div className="mx-auto flex max-w-360 items-center gap-4 overflow-x-auto px-4 py-3 lg:px-[5vw]">
        <nav className="flex min-w-max items-center gap-5 lg:gap-8">{navItems.map(([label, category]) => <button type="button" key={label} onClick={() => onCategoryNavigate(category)} className="bg-transparent text-[9px] font-bold uppercase tracking-[.1em] text-neutral-900 hover:opacity-55">{label}</button>)}<Link to="/catalogo" className="text-[9px] font-bold uppercase tracking-[.1em] text-neutral-900 no-underline hover:opacity-55">Catálogo</Link><Link to="/como-comprar" className="text-[9px] font-bold uppercase tracking-[.1em] text-neutral-900 no-underline hover:opacity-55">Cómo comprar</Link></nav>
        <form className="ml-auto flex h-8 min-w-42 items-center border-b border-neutral-400" onSubmit={(event) => { event.preventDefault(); onSearch() }}>
          <input className="min-w-0 grow bg-transparent px-1 text-xs outline-none" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar productos" aria-label="Buscar productos"/>
          <button className="px-2 text-sm" aria-label="Buscar">⌕</button>
        </form>
      </div>
    </div>
  </header>
}
