import { useState } from 'react'
import type { CatalogFilters } from '../../types/catalog'

type Props = {
  filters?: CatalogFilters
  hasError: boolean
  category: string
  subcategory: string
  brand: string
  hasActive: boolean
  onCategory: (value: string) => void
  onSubcategory: (value: string) => void
  onBrand: (value: string) => void
  onClear: () => void
}

const selectStyle = 'h-12 w-full appearance-none border border-neutral-300 bg-white px-4 pr-9 text-sm font-medium text-neutral-900 outline-none transition focus:border-black'

export function CatalogFilters(props: Props) {
  const [showCategoryChoices, setShowCategoryChoices] = useState(false)
  const activeCategory = props.filters?.categorias.find(
    (item) => String(item.id) === props.category,
  )
  const subcategories = activeCategory?.subcategorias ?? []

  return (
    <div className="border-y border-neutral-200 bg-white py-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <span className="text-[9px] font-semibold tracking-[0.22em] text-neutral-500">{activeCategory ? 'COLECCIÓN SELECCIONADA' : 'ENCONTRÁ TU ESTILO'}</span>
          <h3 className="mt-1 font-serif text-2xl font-semibold">{activeCategory ? activeCategory.nombre : 'Filtrá la colección'}</h3>
          <p className="mt-1 text-sm text-neutral-500">{activeCategory ? 'Estás viendo los productos de esta colección.' : 'Elegí una categoría para recorrer el catálogo de forma más rápida.'}</p>
        </div>
        {props.hasActive && (
          <button className="shrink-0 border border-neutral-300 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-700 transition hover:border-black" onClick={props.onClear}>
            Limpiar todo ×
          </button>
        )}
      </div>

      <div className="mb-5 rounded-sm bg-neutral-50 p-4">
        <div className="mb-3 flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-[.16em] text-neutral-500">{activeCategory ? '¿Querés cambiar de colección?' : 'Elegí una colección'}</span>{activeCategory && <button className="text-[10px] font-bold uppercase tracking-wider text-neutral-800 underline underline-offset-4" onClick={() => setShowCategoryChoices((visible) => !visible)}>{showCategoryChoices ? 'Ocultar categorías' : 'Cambiar colección'}</button>}</div>
      {(!activeCategory || showCategoryChoices) && <div className="flex gap-2 overflow-x-auto pb-1">
          <button className={`shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wider ${!props.category ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`} onClick={() => { props.onCategory(''); setShowCategoryChoices(false) }}>Todo</button>
          {props.filters?.categorias.map((item) => (
            <button key={item.id} className={`shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${String(item.id) === props.category ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`} onClick={() => { props.onCategory(String(item.id)); setShowCategoryChoices(false) }}>
              {item.nombre}
            </button>
          ))}
        </div>}
        <p className="mt-3 text-xs leading-5 text-neutral-500">¿Buscás un modelo puntual? Usá la lupa del encabezado: busca por nombre en todo el catálogo.</p>
      </div>

      {activeCategory && <div className="mb-5 flex flex-wrap items-center gap-2 border-y border-neutral-100 py-4">
        <span className="mr-1 text-[10px] font-bold uppercase tracking-[.16em] text-neutral-500">Colección</span>
        <button className="border border-black bg-black px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white">{activeCategory.nombre}</button>
        <button className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-600 underline-offset-4 hover:underline" onClick={() => props.onCategory('')}>Ver todo el catálogo</button>
      </div>}

      <div className="flex flex-wrap items-end gap-5">
        {subcategories.length > 0 && <div className="min-w-56 grow"><p className="mb-2 text-xs font-bold text-[#737373]">Subcategoría</p><div className="flex gap-2 overflow-x-auto pb-1"><button className={`shrink-0 border px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${!props.subcategory ? 'border-black bg-black text-white' : 'border-neutral-200 bg-white text-neutral-700'}`} onClick={() => props.onSubcategory('')}>Todas</button>{subcategories.map((item) => <button key={item.id} className={`shrink-0 border px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${String(item.id) === props.subcategory ? 'border-black bg-black text-white' : 'border-neutral-200 bg-white text-neutral-700'}`} onClick={() => props.onSubcategory(String(item.id))}>{item.nombre}</button>)}</div></div>}
        <label className="flex w-full max-w-xs flex-col gap-1.5 text-xs font-bold text-[#737373]">Marca<select className={selectStyle} value={props.brand} onChange={(event) => props.onBrand(event.target.value)}><option value="">Todas las marcas</option>{props.filters?.marcas.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
      </div>
      {props.hasError && <p className="mt-3 text-sm text-red-700">No se pudieron cargar los filtros.</p>}
    </div>
  )
}
