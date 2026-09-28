import { apiGet, apiPatch, apiPost } from "./client";
import type { ProductPage } from "../types/catalog";
import type {
  AdminDashboardData,
  AdminFiltersData,
  AdminProductsData,
  ProductAnalytics,
} from "../types/admin";
import type {
  DuxClientPage,
  DuxClientSyncStatus,
  DuxClientTotal,
} from "../types/adminClient";
import type { OrderPage } from "../types/order";
import type { AuthUser } from "../types/auth";

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const [
    all,
    withStock,
    withoutStock,
    filters,
    recent,
    pendingOrders,
    pendingUsers,
  ] = await Promise.all([
    apiGet<ProductPage>("/api/productos/?solo_habilitados=true&page=1&limit=1"),
    apiGet<ProductPage>(
      "/api/productos/?solo_habilitados=true&con_stock=true&page=1&limit=1",
    ),
    apiGet<ProductPage>(
      "/api/productos/?solo_habilitados=true&con_stock=false&page=1&limit=1",
    ),
    apiGet<AdminFiltersData>("/api/catalogo/filtros"),
    apiGet<ProductPage>(
      "/api/productos/?solo_habilitados=true&page=1&limit=6&orden=recientes",
    ),
    apiGet<OrderPage>("/api/admin/pedidos/?estado=pendiente&page=1&limit=1"),
    apiGet<AuthUser[]>("/api/admin/usuarios/pendientes"),
  ]);

  return {
    totalProducts: all.total,
    productsWithStock: withStock.total,
    productsWithoutStock: withoutStock.total,
    categories: filters.categorias.length,
    brands: filters.marcas.length,
    recentProducts: recent.items,
    pendingOrders: pendingOrders.total,
    pendingConfirmations: pendingUsers.length,
  };
}

export function getAdminProducts(page: number, search = "") {
  const params = new URLSearchParams({
    solo_habilitados: "false",
    page: String(page),
    limit: "20",
    orden: "recientes",
  });
  if (search.trim()) params.set("buscar", search.trim());
  return apiGet<AdminProductsData>(`/api/productos/?${params}`);
}

export function setProductVisibility(productId: number, visible: boolean) {
  return apiPatch<{ id: number; visible_tienda: boolean }>(
    `/api/admin/productos/${productId}/visibilidad`,
    { visible },
  );
}

export function syncDuxCatalog() {
  return apiPost<DuxClientSyncStatus>("/api/admin/productos/sincronizar", {});
}

export function getDuxCatalogSyncStatus() {
  return apiGet<DuxClientSyncStatus>("/api/admin/productos/sincronizacion");
}

export function getProductAnalytics(
  days: number | null,
  grouping: "dia" | "semana" | "mes" | "anio",
) {
  return apiGet<ProductAnalytics>(
    `/api/admin/productos/analitica?dias=${days ?? 0}&agrupacion=${grouping}`,
  );
}

export function getDuxClients(page: number, search = "") {
  const params = new URLSearchParams({ pagina: String(page), limite: "20" });
  if (search.trim()) params.set("buscar", search.trim());
  return apiGet<DuxClientPage>(`/api/admin/clientes-dux/?${params}`);
}

export function getWebClients() {
  return apiGet<AuthUser[]>("/api/admin/usuarios/");
}

export function makeWebUserAdmin(userId: number) {
  return apiPatch<AuthUser>(`/api/admin/usuarios/${userId}/hacer-admin`, {
    confirmar: true,
  });
}

export function getDuxClientTotal() {
  return Promise.race([
    apiGet<DuxClientTotal>("/api/admin/clientes-dux/total"),
    new Promise<never>((_, reject) =>
      window.setTimeout(
        () => reject(new Error("El conteo de Dux tardó demasiado.")),
        15000,
      ),
    ),
  ]);
}

export function syncDuxClients() {
  return apiPost<DuxClientSyncStatus>(
    "/api/admin/clientes-dux/sincronizar",
    {},
  );
}

export function getDuxClientSyncStatus() {
  return apiGet<DuxClientSyncStatus>("/api/admin/clientes-dux/sincronizacion");
}

export type DuxConfiguration = {
  escritura_habilitada: boolean;
  sincronizacion_habilitada: boolean;
  modo: "wordpress" | "produccion";
};

export function getDuxConfiguration() {
  return apiGet<DuxConfiguration>("/api/admin/configuracion/dux");
}

export type SizeStockProduct = {
  id: number;
  codigo: string;
  nombre: string;
  stock_dux: number;
  origen: "dux" | "manual" | "sin_configurar";
  talles: Record<string, number>;
};
export type SizeStockPage = {
  items: SizeStockProduct[];
  total: number;
  page: number;
  limit: number;
  total_paginas: number;
};
export const getSizeStocks = (page: number, search: string) =>
  apiGet<SizeStockPage>(
    `/api/admin/productos/stock-talles?page=${page}&limit=20&buscar=${encodeURIComponent(search)}`,
  );
export const saveSizeStocks = (id: number, talles: Record<string, number>) =>
  apiPost<{ id: number; stock_dux: number; total_distribuido: number }>(
    `/api/admin/productos/${id}/stock-talles`,
    {
      talles: Object.entries(talles).map(([talle, cantidad]) => ({
        talle,
        cantidad: cantidad || 0,
      })),
    },
  );

export type WordpressMigrationSummary = {
  solo_lectura: boolean;
  totales: { productos: number; clientes: number; pedidos: number };
  limite_vista_previa: { productos: number; clientes: number; pedidos: number };
  productos: Array<{
    id: string;
    nombre: string;
    estado: string | null;
    tipo: string | null;
    precio: string | null;
    precios_variaciones: string[];
    cantidad_variaciones: number;
    talles: string[];
    stock_total: number;
    imagen: string | null;
  }>;
  clientes: Array<{
    id: string;
    email: string | null;
    nombre: string;
    telefono: string | null;
    localidad: string | null;
    provincia: string | null;
    tiene_direccion: boolean;
    creado_en: string | null;
  }>;
  pedidos: Array<{
    id: string;
    numero: string | null;
    estado: string | null;
    fecha: string | null;
    cliente_id: string | null;
    total: string | null;
    moneda: string | null;
    cantidad_items: number;
    cantidad_unidades: number;
  }>;
};

export const getWordpressMigrationSummary = () =>
  apiGet<WordpressMigrationSummary>("/api/admin/migracion-wordpress/resumen");

export type WordpressMigrationExecution = {
  estado: "pendiente" | "en_progreso" | "completada" | "error";
  etapa: string | null;
  progreso: Record<string, unknown> | null;
  resultado: Record<string, unknown> | null;
  error: string | null;
  iniciada_en?: string | null;
  finalizada_en?: string | null;
  actualizado_en?: string | null;
};
export const getWordpressMigrationExecution = () =>
  apiGet<WordpressMigrationExecution>(
    "/api/admin/migracion-wordpress/ejecucion",
  );
export const runWordpressMigration = () =>
  apiPost<WordpressMigrationExecution>(
    "/api/admin/migracion-wordpress/ejecutar",
    { confirmar: true },
  );

export type ProductReconciliation = {
  disponible: boolean;
  totales?: {
    wordpress: number;
    dux: number;
    coincidencias: number;
    dudosos: number;
    solo_wordpress: number;
    solo_dux: number;
    dux_informados: number;
    dux_omitidos_por_error: number;
    vinculados: number;
  };
};

export const getProductReconciliation = () =>
  apiGet<ProductReconciliation>(
    "/api/admin/migracion-wordpress/conciliacion-productos",
  );

export type ReconciliationCandidate = {
  wordpress_id: string;
  wordpress_nombre: string;
  wordpress_imagen: string | null;
  wordpress_precios: number[];
  wordpress_skus: string[];
  wordpress_talles: string[];
  dux_codigo_sugerido: string;
  dux_nombre_sugerido: string;
  dux_imagen: string | null;
  dux_precios: Array<{
    id: number | null;
    nombre: string | null;
    precio: number;
  }>;
  dux_talles: string[];
  similitud: number;
  motivo?: string;
};
export type ReconciliationCandidatePage = {
  items: ReconciliationCandidate[];
  total: number;
  page: number;
  limit: number;
  total_paginas: number;
};
export const getReconciliationCandidates = (page: number, buscar = "") =>
  apiGet<ReconciliationCandidatePage>(
    `/api/admin/migracion-wordpress/conciliacion-productos/dudosos?page=${page}&limit=20&buscar=${encodeURIComponent(buscar)}`,
  );
export const linkReconciliationCandidate = (
  wordpressId: number,
  duxCode: string,
) =>
  apiPost<{
    producto_id: number;
    wordpress_id: number;
    dux_codigo: string;
    estado: string;
  }>("/api/admin/migracion-wordpress/conciliacion-productos/vincular", {
    wordpress_id: wordpressId,
    dux_codigo: duxCode,
  });
