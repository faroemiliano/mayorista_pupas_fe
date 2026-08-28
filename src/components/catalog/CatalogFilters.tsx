import type { CatalogFilters } from '../../types/catalog'

type Props = { filters?:CatalogFilters; hasError:boolean; category:string; subcategory:string; brand:string; hasActive:boolean; onCategory:(value:string)=>void; onSubcategory:(value:string)=>void; onBrand:(value:string)=>void; onClear:()=>void }

export function CatalogFilters(props:Props) {
  const subcategories=props.filters?.categorias.find(item=>String(item.id)===props.category)?.subcategorias
  return <aside><div className="aside-title"><p className="eyebrow">ENCONTRÁ TU MODELO</p><h2>Filtros</h2></div><label>Categoría<select value={props.category} onChange={e=>props.onCategory(e.target.value)}><option value="">Todas las categorías</option>{props.filters?.categorias.map(item=><option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label><label>Subcategoría<select value={props.subcategory} disabled={!props.category} onChange={e=>props.onSubcategory(e.target.value)}><option value="">Todas las subcategorías</option>{subcategories?.map(item=><option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label><label>Marca<select value={props.brand} onChange={e=>props.onBrand(e.target.value)}><option value="">Todas las marcas</option>{props.filters?.marcas.map(item=><option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>{props.hasActive&&<button className="clear" onClick={props.onClear}>Limpiar filtros</button>}{props.hasError&&<p className="filter-error">No se pudieron cargar los filtros.</p>}</aside>
}
