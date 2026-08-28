import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getAdminProducts } from '../../api/admin'
import { formatCurrency } from '../../utils/currency'

export function AdminProducts() {
  const [page, setPage] = useState(1)
  const products = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => getAdminProducts(page),
    placeholderData: (previous) => previous,
  })

  return <div className="admin-page">
    <header className="admin-page-header"><div><p className="eyebrow">CATÁLOGO DUX</p><h1>Productos</h1><span>Consulta de precios, disponibilidad y estado de publicación.</span></div></header>
    <section className="admin-panel-card admin-table-card">
      <div className="admin-card-header"><div><h2>{products.data?.total ?? 0} productos</h2><p>Los cambios se administran desde Dux y luego se sincronizan.</p></div></div>
      {products.isLoading ? <div className="admin-status"><span className="loader"/></div> : <div className="admin-table-wrap"><table><thead><tr><th>Producto</th><th>Código Dux</th><th>Estado</th><th>Stock</th><th>Mayorista</th><th>24 productos</th></tr></thead><tbody>{products.data?.items.map((product) => <tr key={product.id}><td><strong>{product.nombre}</strong><small>{product.marca?.nombre || 'Sin marca'}</small></td><td>{product.dux_codigo}</td><td><span className={product.habilitado ? 'admin-state active' : 'admin-state'}>{product.habilitado ? 'Publicado' : 'Oculto'}</span></td><td>{Number(product.stock_disponible)}</td><td>{product.precio_mayorista ? formatCurrency(Number(product.precio_mayorista)) : '—'}</td><td>{product.precio_24_productos ? formatCurrency(Number(product.precio_24_productos)) : '—'}</td></tr>)}</tbody></table></div>}
      {products.data && products.data.total_paginas > 1 && <nav className="pagination"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>← Anterior</button><span>Página {page} de {products.data.total_paginas}</span><button disabled={page >= products.data.total_paginas} onClick={() => setPage((value) => value + 1)}>Siguiente →</button></nav>}
    </section>
  </div>
}
