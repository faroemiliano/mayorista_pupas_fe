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
  const subcategories = props.filters?.categorias.find(
    (item) => String(item.id) === props.category,
  )?.subcategorias

  return (
    <div className="border-y border-neutral-200 bg-white py-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <span className="text-[9px] font-semibold tracking-[0.22em] text-neutral-500">ENCONTRÁ TU ESTILO</span>
          <h3 className="mt-1 font-serif text-2xl font-semibold">Filtrá la colección</h3>
        </div>
        {props.hasActive && (
          <button className="shrink-0 border border-neutral-300 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-700 transition hover:border-black" onClick={props.onClear}>
            Limpiar todo ×
          </button>
        )}
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <button className={`shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${!props.category ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`} onClick={() => props.onCategory('')}>Todo</button>
        {props.filters?.categorias.map((item) => (
          <button key={item.id} className={`shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${String(item.id) === props.category ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`} onClick={() => props.onCategory(String(item.id))}>
            {item.nombre}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-xs font-bold text-[#737373]">Categoría<select className={selectStyle} value={props.category} onChange={(event) => props.onCategory(event.target.value)}><option value="">Todas las categorías</option>{props.filters?.categorias.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
        <label className="flex flex-col gap-1.5 text-xs font-bold text-[#737373]">Subcategoría<select className={`${selectStyle} disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400`} value={props.subcategory} disabled={!props.category} onChange={(event) => props.onSubcategory(event.target.value)}><option value="">Todas las subcategorías</option>{subcategories?.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
        <label className="flex flex-col gap-1.5 text-xs font-bold text-[#737373]">Marca<select className={selectStyle} value={props.brand} onChange={(event) => props.onBrand(event.target.value)}><option value="">Todas las marcas</option>{props.filters?.marcas.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
      </div>
      {props.hasError && <p className="mt-3 text-sm text-red-700">No se pudieron cargar los filtros.</p>}
    </div>
  )
}
