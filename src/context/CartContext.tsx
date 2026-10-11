import {createContext,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from 'react'
import {useQueryClient} from '@tanstack/react-query'
import type {Product} from '../types/catalog'
import type {CartItem} from '../types/cart'
import {reserveCart} from '../api/cart'
import {useAuth} from './AuthContext'

const STORAGE_KEY='pupas-mayorista-cart'
type Entry={product:Product;quantity:number;talle?:string}
type Value={items:CartItem[];isOpen:boolean;totalUnits:number;addItem:(p:Product,q:number,t?:string)=>void;addMany:(items:Entry[])=>void;updateQuantity:(id:number,t:string,q:number)=>void;removeItem:(id:number,t:string)=>void;clearCart:()=>void;openCart:()=>void;closeCart:()=>void}
const Context=createContext<Value|null>(null)
const load=():CartItem[]=>{try{return (JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]') as CartItem[]).filter(item=>item.talle)}catch{return[]}}
const firstSize=(product:Product,requested?:string)=>requested??product.talles?.find(item=>item.disponible>0)?.talle
const adjustUnavailableItem=(items:CartItem[],message:string):CartItem[]|null=>{
 const match=message.match(/El producto (\d+), talle (.+?), tiene (\d+) unidades disponibles\.?/i)
 if(!match)return null
 const productId=Number(match[1]),size=match[2].trim(),available=Number(match[3])
 const current=items.find(item=>item.product.id===productId&&item.talle===size)
 if(!current||current.quantity<=available)return null
 return items
  .map(item=>item===current?{...item,quantity:available}:item)
  .filter(item=>item.quantity>0)
}

export function CartProvider({children}:{children:ReactNode}){
 const [items,setItems]=useState<CartItem[]>(load),[isOpen,setOpen]=useState(false)
 const {user}=useAuth(),queryClient=useQueryClient(),confirmed=useRef<CartItem[]>(load()),firstSync=useRef(true)
 const canReserve=Boolean(user?.rol==="cliente")
 useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(items)),[items])
 useEffect(()=>{
  if(!canReserve)return
  const delay=firstSync.current?0:250;firstSync.current=false
  const timer=window.setTimeout(()=>{reserveCart(items).then(()=>{confirmed.current=items;queryClient.invalidateQueries({queryKey:['products']});queryClient.invalidateQueries({queryKey:['product-detail']});queryClient.invalidateQueries({queryKey:['admin-products']});queryClient.invalidateQueries({queryKey:['admin-product-stock-count']});queryClient.invalidateQueries({queryKey:['admin-dashboard']})}).catch(reason=>{const message=reason instanceof Error?reason.message:'No pudimos reservar ese stock.';const adjusted=adjustUnavailableItem(items,message);if(adjusted){confirmed.current=adjusted;setItems(adjusted);window.alert('Actualizamos tu carrito porque cambió el stock disponible. Revisá las cantidades antes de continuar.')}else{setItems(confirmed.current);window.alert(`${message} El carrito volvió a su última cantidad disponible.`)}})},delay)
  return()=>window.clearTimeout(timer)
 },[items,canReserve,queryClient])
 useEffect(()=>{if(!canReserve||!items.length)return;const heartbeat=window.setInterval(()=>{reserveCart(items).catch(()=>undefined)},5*60*1000);return()=>window.clearInterval(heartbeat)},[items,canReserve])
 const value=useMemo<Value>(()=>({items,isOpen,totalUnits:items.reduce((n,x)=>n+x.quantity,0),
  addItem(product,quantity,requested){const talle=firstSize(product,requested);if(!talle)return;const available=product.talles.find(x=>x.talle===talle)?.disponible??0;if(quantity<1||available<1)return;setItems(current=>{const found=current.find(x=>x.product.id===product.id&&x.talle===talle);return found?current.map(x=>x===found?{...x,product,quantity:Math.min(x.quantity+quantity,x.quantity+available)}:x):[...current,{product,quantity:Math.min(quantity,available),talle}]});setOpen(true)},
  addMany(entries){setItems(current=>{const result=[...current];for(const entry of entries){const talle=firstSize(entry.product,entry.talle);if(!talle)continue;const max=entry.product.talles.find(x=>x.talle===talle)?.disponible??0;if(max<1)continue;const found=result.find(x=>x.product.id===entry.product.id&&x.talle===talle);if(found)found.quantity=Math.min(found.quantity+entry.quantity,max);else result.push({product:entry.product,quantity:Math.min(entry.quantity,max),talle})}return [...result]});setOpen(true)},
  updateQuantity(id,talle,quantity){setItems(current=>current.map(item=>{if(item.product.id!==id||item.talle!==talle)return item;const max=item.product.talles.find(x=>x.talle===talle)?.disponible??0;return {...item,quantity:Math.min(Math.max(quantity,0),max)}}).filter(x=>x.quantity>0))},
  removeItem(id,talle){setItems(current=>current.filter(x=>x.product.id!==id||x.talle!==talle))},clearCart(){setItems([])},openCart(){setOpen(true)},closeCart(){setOpen(false)}
 }),[items,isOpen])
 return <Context.Provider value={value}>{children}</Context.Provider>
}
export function useCart(){const value=useContext(Context);if(!value)throw new Error('useCart debe utilizarse dentro de CartProvider');return value}
