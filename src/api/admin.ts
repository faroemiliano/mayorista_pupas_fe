import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "./client";
import type { Product, ProductPage } from "../types/catalog";
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

export function getAdminProducts(page: number, search = "", conStock?: boolean, order = "recientes") {
  const params = new URLSearchParams({
    solo_habilitados: "false",
    page: String(page),
    limit: "20",
    orden: order,
  });
  if (search.trim()) params.set("buscar", search.trim());
  if (conStock !== undefined) params.set("con_stock", String(conStock));
  return apiGet<AdminProductsData>(`/api/productos/?${params}`);
}

export function setProductVisibility(productId: number, visible: boolean) {
  return apiPatch<{ id: number; visible_tienda: boolean }>(
    `/api/admin/productos/${productId}/visibilidad`,
    { visible },
  );
}

export function setProductFeatured(productId: number, destacado: boolean) {
  return apiPatch<{ id: number; destacado: boolean; orden_destacado: number | null }>(
    `/api/admin/productos/${productId}/destacado`,
    { destacado },
  );
}

export type ProductEditorPayload = {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria_id: number | null;
  subcategoria_id: number | null;
  marca_id: number | null;
  precio_mayorista: number;
  precio_24_productos: number | null;
  cantidad_unidades_por_bulto: number | null;
  talles: Array<{ talle: string; cantidad: number }>;
  habilitado: boolean;
  visible_tienda: boolean;
};

export const createAdminProduct = (payload: ProductEditorPayload) =>
  apiPost<{ id: number; mensaje: string }>("/api/admin/productos/", payload);
export const updateAdminProduct = (id: number, payload: ProductEditorPayload) =>
  apiPut<{ id: number; mensaje: string }>(
    `/api/admin/productos/${id}`,
    payload,
  );
export const uploadAdminProductImage = (
  id: number,
  payload: {
    nombre: string;
    media_type: string;
    contenido_base64: string;
    principal: boolean;
  },
) => apiPost<{ id: number }>(`/api/admin/productos/${id}/imagenes`, payload);
export const deleteAdminProductImage = (productId: number, imageId: number) =>
  apiDelete(`/api/admin/productos/${productId}/imagenes/${imageId}`);
export const setAdminProductMainImage = (productId: number, imageId: number) =>
  apiPatch<{ id: number; principal: boolean }>(
    `/api/admin/productos/${productId}/imagenes/${imageId}/principal`,
    {},
  );
export const getAdminProduct = (id: number) =>
  apiGet<Product>(`/api/productos/${id}`);

export function syncDuxCatalog() {
  return apiPost<DuxClientSyncStatus>("/api/admin/productos/sincronizar", {});
}

export function getDuxCatalogSyncStatus() {
  return apiGet<DuxClientSyncStatus>("/api/admin/productos/sincronizacion");
}

export function getProductAnalytics(
  days: number | null,
  grouping: "dia" | "semana" | "mes" | "anio",
  fechaDesde = "",
  fechaHasta = "",
) {
  const params = new URLSearchParams({ dias: String(days ?? 0), agrupacion: grouping })
  if (fechaDesde) params.set('fecha_desde', fechaDesde)
  if (fechaHasta) params.set('fecha_hasta', fechaHasta)
  return apiGet<ProductAnalytics>(
    `/api/admin/productos/analitica?${params}`,
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

export const setDuxStockMode = (habilitado: boolean) =>
  apiPatch<DuxConfiguration>("/api/admin/configuracion/dux/modo", {
    habilitado,
  });

export type DuxStockComparison = {
  consultados: number;
  total_diferencias: number;
  solo_lectura: boolean;
  diferencias: Array<{
    codigo: string;
    nombre: string;
    producto_id: number | null;
    stock_dux: number;
    stock_pagina: number | null;
    estado: string;
  }>;
};

export const compareDuxStock = () =>
  apiPost<DuxStockComparison>(
    "/api/admin/configuracion/dux/comparar-stock",
    {},
  );

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
export const runWordpressMigration = (updateAll = false) =>
  apiPost<WordpressMigrationExecution>(
    "/api/admin/migracion-wordpress/ejecutar",
    { confirmar: true, actualizar_todo: updateAll },
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
