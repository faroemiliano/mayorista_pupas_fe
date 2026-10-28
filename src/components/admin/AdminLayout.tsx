import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Brand } from "../layout/Brand";
import { adminStyles } from "../../styles/tailwind";
import { useQuery } from "@tanstack/react-query";
import { getDuxConfiguration } from "../../api/admin";
import { useAuth } from "../../context/AuthContext";

type NavigationItem = { to: string; label: string; icon: string; end?: boolean; soloAdminTotal?: boolean; soloAdminTecnico?: boolean };

const navigation: Array<{ label: string; items: NavigationItem[] }> = [
  { label: "Operación", items: [
    { to: "/admin", label: "Resumen", icon: "⌂", end: true },
    { to: "/admin/pedidos", label: "Pedidos", icon: "▤" },
    { to: "/admin/confirmaciones", label: "Confirmaciones", icon: "✓" },
    { to: "/admin/clientes", label: "Clientes", icon: "♙" },
  ]},
  { label: "Catálogo", items: [
    { to: "/admin/productos", label: "Productos", icon: "◇" },
    { to: "/admin/stock-talles", label: "Stock por talles", icon: "▦", soloAdminTecnico: true },
    { to: "/admin/materiales", label: "Material para clientes", icon: "▧" },
  ]},
  { label: "Comunidad", items: [
    { to: "/admin/notificaciones", label: "Notificaciones", icon: "●" },
    { to: "/admin/opiniones", label: "Opiniones", icon: "★" },
  ]},
  { label: "Análisis", items: [
    { to: "/admin/analitica", label: "Analítica", icon: "↗", soloAdminTotal: true },
    { to: "/admin/trafico", label: "Tráfico", icon: "◌", soloAdminTotal: true },
  ]},
  { label: "Sistema", items: [
    { to: "/admin/migracion-wordpress", label: "Migración WordPress", icon: "⇄", soloAdminTecnico: true },
    { to: "/admin/configuracion", label: "Configuración", icon: "⚙", soloAdminTecnico: true },
  ]},
];

export function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const esAdminTotal = user?.rol === "admin_tecnico" || user?.rol === "admin";
  const esAdminTecnico = user?.rol === "admin_tecnico";
  const duxConfiguration = useQuery({ queryKey: ["dux-configuration"], queryFn: getDuxConfiguration });
  const escrituraHabilitada = duxConfiguration.data?.escritura_habilitada === true;
  const sincronizacionHabilitada = duxConfiguration.data?.sincronizacion_habilitada === true;

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <div className={adminStyles}>
      <aside className="relative z-30 flex flex-col border-b border-white/10 bg-[#111111] text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 lg:block lg:px-6 lg:py-6">
          <div className="w-fit rounded-lg bg-white px-3 py-1 shadow-sm"><Brand compact /></div>
          <button type="button" className="grid size-11 place-items-center rounded-lg border border-white/15 bg-white/5 text-xl lg:hidden" aria-label={menuOpen ? "Cerrar menú administrativo" : "Abrir menú administrativo"} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>
            {menuOpen ? "×" : "☰"}
          </button>
          <div className="mt-5 hidden lg:block">
            <p className="text-[9px] font-bold uppercase tracking-[.24em] text-white/40">Administración</p>
            <p className="mt-1 text-sm font-semibold text-white/90">Panel de gestión</p>
          </div>
        </div>

        <div className={`${menuOpen ? "flex" : "hidden"} max-h-[72vh] flex-col overflow-y-auto px-3 py-4 lg:flex lg:max-h-none lg:min-h-0 lg:flex-1 lg:px-4 lg:py-5`}>
          <nav className="space-y-6" aria-label="Navegación administrativa">
            {navigation.map((section) => {
              const items = section.items.filter((item) => (!item.soloAdminTotal || esAdminTotal) && (!item.soloAdminTecnico || esAdminTecnico));
              if (!items.length) return null;
              return <section key={section.label}>
                <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[.2em] text-white/35">{section.label}</p>
                <div className="space-y-1">
                  {items.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition ${isActive ? "bg-white text-black shadow-sm" : "text-white/65 hover:bg-white/8 hover:text-white"}`}>
                    {({ isActive }) => <><span className={`grid size-7 shrink-0 place-items-center rounded-lg text-sm ${isActive ? "bg-black text-white" : "bg-white/8 text-white/70 group-hover:bg-white/12"}`} aria-hidden="true">{item.icon}</span><span className="min-w-0 leading-tight">{item.label}</span></>}
                  </NavLink>)}
                </div>
              </section>;
            })}
          </nav>

          <div className="mt-7 border-t border-white/10 pt-4">
            <div className="rounded-xl bg-white/5 p-3">
              <p className="truncate text-xs font-semibold text-white/90">{user?.nombre} {user?.apellido}</p>
              <p className="mt-1 truncate text-[10px] text-white/40">{user?.email}</p>
            </div>
            <Link className="mt-2 flex items-center gap-2 rounded-xl px-3 py-3 text-xs font-semibold text-white/60 no-underline transition hover:bg-white/8 hover:text-white" to="/"><span aria-hidden="true">←</span> Volver a la tienda</Link>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-dev-warning">
          <strong>{escrituraHabilitada ? "Dux conectado" : "Modo catálogo WordPress"}</strong>
          <span>{escrituraHabilitada ? "La creación de clientes y pedidos en Dux está habilitada." : sincronizacionHabilitada ? "Dux está disponible sólo para sincronizaciones controladas." : "La tienda utiliza la copia local de WordPress. La sincronización y escritura con Dux están pausadas."}</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
