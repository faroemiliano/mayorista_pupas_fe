import { Brand } from './Brand'
import { useCart } from '../../context/CartContext'
import { GoogleAccessButton, useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

type Props = { search:string; onSearchChange:(value:string)=>void; onSearch:()=>void }

export function Header({ search, onSearchChange, onSearch }:Props) {
  const cart = useCart()
  const { user } = useAuth()
  return <header><Brand/><form className="search" onSubmit={(event)=>{event.preventDefault();onSearch()}}><span>⌕</span><input value={search} onChange={(event)=>onSearchChange(event.target.value)} placeholder="Buscar bikinis, pijamas o lencería..." aria-label="Buscar productos"/><button>Buscar</button></form>{user&&<Link className="shrink-0 rounded-md bg-rose-50 px-3 py-2 text-xs font-extrabold text-[#722f55] no-underline" to="/mi-cuenta">Mi cuenta</Link>}{user?.rol==='admin'&&<Link className="shrink-0 rounded-md bg-[#ffcfdf] px-3 py-2 text-xs font-extrabold text-[#722f55] no-underline" to="/admin">Panel admin</Link>}<GoogleAccessButton/>{user&&<button className="cart" type="button" onClick={cart.openCart}><span>🛍️</span><div><small>Tu pedido</small><strong>{cart.totalUnits} {cart.totalUnits===1?'producto':'productos'}</strong></div>{cart.totalUnits>0&&<b className="cart-count">{cart.totalUnits}</b>}</button>}</header>
}
