export type CatalogOption = { id: number; nombre: string; slug: string }
export type CatalogCategory = CatalogOption & { subcategorias: CatalogOption[] }
export type CatalogFilters = { categorias: CatalogCategory[]; marcas: CatalogOption[] }

export type Product = {
  id: number
  dux_codigo: string
  nombre: string
  slug: string
  descripcion: string | null
  precio_mayorista: string | null
  precio_24_productos: string | null
  stock_disponible: string
  tiene_stock: boolean
  imagen_url: string | null
  categoria: CatalogOption | null
  subcategoria: CatalogOption | null
  marca: CatalogOption | null
  cantidad_unidades_por_bulto: string | null
  habilitado: boolean
}

export type ProductPage = {
  items: Product[]
  total: number
  page: number
  limit: number
  total_paginas: number
}

export type ProductQuery = {
  buscar: string
  categoriaId: string
  subcategoriaId: string
  marcaId: string
  orden: string
  page: number
}
