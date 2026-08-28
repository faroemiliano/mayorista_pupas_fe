import { NavLink, Outlet } from 'react-router-dom'
import { Brand } from '../layout/Brand'
import { adminStyles } from '../../styles/tailwind'
import { useQuery } from '@tanstack/react-query'
import { getDuxConfiguration } from '../../api/admin'

const navigation = [
  { to: '/admin', label: 'Resumen', icon: '⌂', end: true },
  { to: '/admin/pedidos', label: 'Pedidos', icon: '▤' },
  { to: '/admin/confirmaciones', label: 'Confirmaciones', icon: '✓' },
  { to: '/admin/productos', label: 'Productos', icon: '◇' },
  { to: '/admin/analitica', label: 'Analítica', icon: '↗' },
  { to: '/admin/clientes', label: 'Clientes', icon: '♙' },
  { to: '/admin/configuracion', label: 'Configuración', icon: '⚙' },
]

export function AdminLayout() {
  const duxConfiguration = useQuery({ queryKey: ['dux-configuration'], queryFn: getDuxConfiguration })
  const escrituraHabilitada = duxConfiguration.data?.escritura_habilitada === true
  return (
    <div className={adminStyles}>
      <aside className="admin-sidebar">
        <Brand />
        <span className="admin-role">Panel administrativo</span>
        <nav>
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <a className="back-to-store" href="/">← Volver a la tienda</a>
      </aside>
      <main className="admin-main">
        <div className="admin-dev-warning">
          <strong>{escrituraHabilitada ? 'Dux conectado' : 'Modo desarrollo seguro'}</strong>
          <span>{escrituraHabilitada ? 'La creación de clientes y pedidos en Dux está habilitada.' : 'La escritura en Dux está deshabilitada. Las sincronizaciones de lectura funcionan normalmente.'}</span>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
