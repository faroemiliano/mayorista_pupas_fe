import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react'
import type {Product} from '../types/catalog'
import type {CartItem} from '../types/cart'

const STORAGE_KEY='pupas-mayorista-cart'
type Entry={product:Product;quantity:number;talle?:number}
type Value={items:CartItem[];isOpen:boolean;totalUnits:number;addItem:(p:Product,q:number,t?:number)=>void;addMany:(items:Entry[])=>void;updateQuantity:(id:number,t:number,q:number)=>void;removeItem:(id:number,t:number)=>void;clearCart:()=>void;openCart:()=>void;closeCart:()=>void}
const Context=createContext<Value|null>(null)
const load=():CartItem[]=>{try{return (JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]') as CartItem[]).filter(item=>item.talle)}catch{return[]}}
const firstSize=(product:Product,requested?:number)=>requested??product.talles?.find(item=>item.disponible>0)?.talle

export function CartProvider({children}:{children:ReactNode}){
 const [items,setItems]=useState<CartItem[]>(load),[isOpen,setOpen]=useState(false)
 useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(items)),[items])
 const value=useMemo<Value>(()=>({items,isOpen,totalUnits:items.reduce((n,x)=>n+x.quantity,0),
  addItem(product,quantity,requested){const talle=firstSize(product,requested);if(!talle)return;const max=product.talles.find(x=>x.talle===talle)?.disponible??0;if(quantity<1||max<1)return;setItems(current=>{const found=current.find(x=>x.product.id===product.id&&x.talle===talle);return found?current.map(x=>x===found?{...x,product,quantity:Math.min(x.quantity+quantity,max)}:x):[...current,{product,quantity:Math.min(quantity,max),talle}]});setOpen(true)},
  addMany(entries){setItems(current=>{const result=[...current];for(const entry of entries){const talle=firstSize(entry.product,entry.talle);if(!talle)continue;const max=entry.product.talles.find(x=>x.talle===talle)?.disponible??0;if(max<1)continue;const found=result.find(x=>x.product.id===entry.product.id&&x.talle===talle);if(found)found.quantity=Math.min(found.quantity+entry.quantity,max);else result.push({product:entry.product,quantity:Math.min(entry.quantity,max),talle})}return [...result]});setOpen(true)},
  updateQuantity(id,talle,quantity){setItems(current=>current.map(item=>{if(item.product.id!==id||item.talle!==talle)return item;const max=item.product.talles.find(x=>x.talle===talle)?.disponible??0;return {...item,quantity:Math.min(Math.max(quantity,0),max)}}).filter(x=>x.quantity>0))},
  removeItem(id,talle){setItems(current=>current.filter(x=>x.product.id!==id||x.talle!==talle))},clearCart(){setItems([])},openCart(){setOpen(true)},closeCart(){setOpen(false)}
 }),[items,isOpen])
 return <Context.Provider value={value}>{children}</Context.Provider>
}
export function useCart(){const value=useContext(Context);if(!value)throw new Error('useCart debe utilizarse dentro de CartProvider');return value}
