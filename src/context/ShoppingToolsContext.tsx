import { createContext,useContext,useEffect,useMemo,useState,type ReactNode } from 'react'
import type { Product } from '../types/catalog'
const FAV='pupas-favorites',RECENT='pupas-recent-products'
const load=(key:string):Product[]=>{try{return JSON.parse(localStorage.getItem(key)||'[]') as Product[]}catch{return[]}}
type Value={favorites:Product[];recent:Product[];isFavorite:(id:number)=>boolean;toggleFavorite:(p:Product)=>void;view:(p:Product)=>void}
const Context=createContext<Value|null>(null)
export function ShoppingToolsProvider({children}:{children:ReactNode}){
 const [favorites,setFavorites]=useState<Product[]>(()=>load(FAV)),[recent,setRecent]=useState<Product[]>(()=>load(RECENT))
 useEffect(()=>localStorage.setItem(FAV,JSON.stringify(favorites)),[favorites]);useEffect(()=>localStorage.setItem(RECENT,JSON.stringify(recent)),[recent])
 const value=useMemo<Value>(()=>({favorites,recent,isFavorite:id=>favorites.some(p=>p.id===id),toggleFavorite:p=>setFavorites(current=>current.some(x=>x.id===p.id)?current.filter(x=>x.id!==p.id):[p,...current]),view:p=>setRecent(current=>[p,...current.filter(x=>x.id!==p.id)].slice(0,8))}),[favorites,recent])
 return <Context.Provider value={value}>{children}</Context.Provider>
}
export function useShoppingTools(){const value=useContext(Context);if(!value)throw new Error('ShoppingToolsProvider faltante');return value}
