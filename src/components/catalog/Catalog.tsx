import { useState } from 'react'
import { useCatalogFilters, useProducts } from '../../hooks/useCatalog'
import { CatalogFilters } from './CatalogFilters'
import { ProductCard } from './ProductCard'

type Props = { search:string; submittedSearch:string; onClearSearch:()=>void }

export function Catalog({ search, submittedSearch, onClearSearch }:Props) {
  const [category,setCategory]=useState(''),[subcategory,setSubcategory]=useState(''),[brand,setBrand]=useState(''),[order,setOrder]=useState('nombre_asc'),[page,setPage]=useState(1)
  const filters=useCatalogFilters()
  const products=useProducts({buscar:submittedSearch,categoriaId:category,subcategoriaId:subcategory,marcaId:brand,orden:order,page})
  const update=(callback:()=>void)=>{callback();setPage(1)}
  const clear=()=>{setCategory('');setSubcategory('');setBrand('');setPage(1);onClearSearch()}

  return <section className="catalog" id="catalogo">
    <CatalogFilters filters={filters.data} hasError={filters.isError} category={category} subcategory={subcategory} brand={brand} hasActive={Boolean(category||subcategory||brand||search||submittedSearch)} onCategory={value=>update(()=>{setCategory(value);setSubcategory('')})} onSubcategory={value=>update(()=>setSubcategory(value))} onBrand={value=>update(()=>setBrand(value))} onClear={clear}/>
    <div className="products"><div className="catalog-header"><div><p className="eyebrow">COLECCIÓN MAYORISTA</p><h2>Todos los productos</h2><small>{products.data?.total??0} productos disponibles</small></div><label>Ordenar por<select value={order} onChange={e=>update(()=>setOrder(e.target.value))}><option value="nombre_asc">Nombre A–Z</option><option value="nombre_desc">Nombre Z–A</option><option value="precio_asc">Menor precio</option><option value="precio_desc">Mayor precio</option></select></label></div>
      {products.isLoading&&<div className="status"><span className="loader"/><h3>Cargando colección…</h3></div>}
      {products.isError&&<div className="status"><span>!</span><h3>No pudimos cargar la colección</h3><p>{products.error.message}</p><button onClick={()=>products.refetch()}>Reintentar</button></div>}
      {!products.isLoading&&!products.isError&&products.data?.items.length===0&&<div className="status"><span>⌕</span><h3>No encontramos productos</h3><p>Probá cambiando la búsqueda o los filtros.</p></div>}
      <div className={`product-grid ${products.isFetching?'updating':''}`}>{products.data?.items.map(product=><ProductCard key={product.id} product={product}/>)}</div>
      {products.data&&products.data.total_paginas>1&&<nav className="pagination" aria-label="Paginación"><button disabled={page===1} onClick={()=>setPage(value=>value-1)}>← Anterior</button><span>Página {page} de {products.data.total_paginas}</span><button disabled={page>=products.data.total_paginas} onClick={()=>setPage(value=>value+1)}>Siguiente →</button></nav>}
    </div>
  </section>
}
