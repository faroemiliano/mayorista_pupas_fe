import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";
import { getTrafficAnalytics } from "../../api/admin";
import type { TrafficAnalytics } from "../../types/admin";

type Metric = "usuarios" | "sesiones" | "vistas_paginas";

const metricLabels: Record<Metric, string> = {
  usuarios: "Usuarios",
  sesiones: "Sesiones",
  vistas_paginas: "Vistas",
};

const fechaActualArgentina = () => new Date().toLocaleDateString("sv-SE", {
  timeZone: "America/Argentina/Buenos_Aires",
});

function TrafficChart({ points }: { points: TrafficAnalytics["serie_diaria"] }) {
  const [metric, setMetric] = useState<Metric>("usuarios");
  if (!points.length) return <div className="analytics-empty">Google Analytics todavía no tiene datos para este período.</div>;
  const values = points.map((point) => point[metric]);
  const maximum = Math.max(...values, 1);
  const width = 900;
  const height = 260;
  const left = 48;
  const right = 14;
  const top = 18;
  const bottom = 36;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const x = (index: number) => left + (points.length <= 1 ? chartWidth / 2 : index * chartWidth / (points.length - 1));
  const y = (value: number) => top + chartHeight - (value / maximum) * chartHeight;
  const path = points.map((point, index) => `${x(index)},${y(point[metric])}`).join(" ");
  const labelCount = Math.min(6, points.length);
  const labelIndexes = new Set(Array.from({ length: labelCount }, (_, index) => Math.round(index * (points.length - 1) / Math.max(labelCount - 1, 1))));

  return <section className="admin-panel-card overflow-hidden">
    <div className="admin-card-header flex-wrap gap-3">
      <div><h2>Visitas por día</h2><p>Datos de Google Analytics; pueden demorar algunas horas en consolidarse.</p></div>
      <div className="flex border border-neutral-300 bg-white p-1">
        {(Object.keys(metricLabels) as Metric[]).map((item) => <button key={item} type="button" onClick={() => setMetric(item)} className={`px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider ${metric === item ? "bg-black text-white" : "text-neutral-500"}`}>{metricLabels[item]}</button>)}
      </div>
    </div>
    <div className="overflow-x-auto p-4 sm:p-6"><svg className="min-w-[650px]" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${metricLabels[metric]} por día`}>
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => <g key={ratio}><line x1={left} x2={width - right} y1={top + chartHeight * ratio} y2={top + chartHeight * ratio} stroke="#e5e5e5" /><text x={left - 8} y={top + chartHeight * ratio + 4} textAnchor="end" fontSize="10" fill="#737373">{Math.round(maximum * (1 - ratio))}</text></g>)}
      <polyline points={path} fill="none" stroke="#111" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((point, index) => <g key={point.fecha}><circle cx={x(index)} cy={y(point[metric])} r="4" fill="#fff" stroke="#111" strokeWidth="2"><title>{`${point.etiqueta}: ${point[metric].toLocaleString("es-AR")}`}</title></circle>{labelIndexes.has(index) && <text x={x(index)} y={height - 12} textAnchor="middle" fontSize="10" fill="#737373">{point.etiqueta}</text>}</g>)}
    </svg></div>
  </section>;
}

function TrafficTable({ title, children }: { title: string; children: ReactNode }) {
  return <section className="admin-panel-card admin-table-card analytics-table"><div className="admin-card-header"><div><h2>{title}</h2></div></div>{children}</section>;
}

export function AdminTrafficAnalytics() {
  const [days, setDays] = useState<7 | 30>(7);
  const [selectedDate, setSelectedDate] = useState(fechaActualArgentina);
  const traffic = useQuery({
    queryKey: ["admin-traffic", days, selectedDate],
    queryFn: () => getTrafficAnalytics(days, selectedDate),
    staleTime: 10 * 60 * 1000,
  });
  const data = traffic.data;

  return <div className="admin-page">
    <header className="admin-page-header">
      <div><p className="eyebrow">VISITAS A LA TIENDA</p><h1>Tráfico del sitio</h1><span>Personas que visitan Pupas Mayorista, páginas vistas y dispositivos utilizados.</span></div>
      <div className="flex flex-wrap items-center gap-2"><div className="flex border border-neutral-300 bg-white p-1"><button type="button" onClick={() => setSelectedDate(fechaActualArgentina())} className={`px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider ${selectedDate ? "bg-black text-white" : "text-neutral-500"}`}>Hoy</button>{([7, 30] as const).map((period) => <button key={period} type="button" onClick={() => { setDays(period); setSelectedDate(""); }} className={`px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider ${!selectedDate && days === period ? "bg-black text-white" : "text-neutral-500"}`}>Últimos {period} días</button>)}</div><button type="button" className="admin-filter" onClick={() => traffic.refetch()} disabled={traffic.isFetching}>Actualizar</button></div>
    </header>
    {traffic.isLoading ? <div className="admin-status"><span className="loader" /><p>Consultando el tráfico…</p></div>
      : traffic.isError || !data ? <div className="admin-status"><strong>No se pudo cargar el tráfico</strong><p>{traffic.error instanceof Error ? traffic.error.message : "Revisá la configuración de Google Analytics."}</p><button type="button" onClick={() => traffic.refetch()}>Reintentar</button></div>
      : <>
        <div className="analytics-scope"><strong>{data.fecha ? `Día consultado: ${new Date(`${data.fecha}T00:00:00`).toLocaleDateString("es-AR", { dateStyle: "long" })}` : `Fuente: ${data.fuente}`}</strong><span>Actualizado {new Date(data.actualizado_en).toLocaleString("es-AR")}. Las visitas en tiempo real corresponden a los últimos 30 minutos.</span></div>
        <section className="admin-metrics">
          <article><span>ACTIVOS AHORA</span><strong>{data.resumen.usuarios_activos_ahora ?? "—"}</strong><small>Últimos 30 minutos</small></article>
          <article><span>USUARIOS</span><strong>{data.resumen.usuarios.toLocaleString("es-AR")}</strong><small>Personas distintas que visitaron</small></article>
          <article><span>SESIONES</span><strong>{data.resumen.sesiones.toLocaleString("es-AR")}</strong><small>Visitas iniciadas</small></article>
          <article><span>VISTAS DE PÁGINA</span><strong>{data.resumen.vistas_paginas.toLocaleString("es-AR")}</strong><small>Páginas vistas en total</small></article>
        </section>
        <TrafficChart points={data.serie_diaria} />
        <div className="analytics-grid">
          <TrafficTable title="Páginas más visitadas">{data.paginas_populares.length ? <div className="admin-table-wrap"><table><thead><tr><th>Página</th><th>Vistas</th><th>Usuarios</th></tr></thead><tbody>{data.paginas_populares.map((item) => <tr key={item.ruta}><td><strong>{item.ruta === "/" ? "Inicio" : item.ruta}</strong></td><td>{item.vistas_paginas.toLocaleString("es-AR")}</td><td>{item.usuarios.toLocaleString("es-AR")}</td></tr>)}</tbody></table></div> : <div className="analytics-empty">Sin páginas registradas todavía.</div>}</TrafficTable>
          <TrafficTable title="Dispositivos">{data.dispositivos.length ? <div className="admin-table-wrap"><table><thead><tr><th>Dispositivo</th><th>Usuarios</th></tr></thead><tbody>{data.dispositivos.map((item) => <tr key={item.dispositivo}><td><strong>{item.dispositivo === "mobile" ? "Celular" : item.dispositivo === "desktop" ? "Computadora" : item.dispositivo === "tablet" ? "Tablet" : item.dispositivo}</strong></td><td>{item.usuarios.toLocaleString("es-AR")}</td></tr>)}</tbody></table></div> : <div className="analytics-empty">Sin datos de dispositivos todavía.</div>}</TrafficTable>
        </div>
      </>}
  </div>;
}
