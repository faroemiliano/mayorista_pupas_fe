import { useEffect, useState } from "react";
import { useCatalogFilters, useProducts } from "../../hooks/useCatalog";
import { CatalogFilters } from "./CatalogFilters";
import { ProductCard } from "./ProductCard";
import { CompactProductCard } from "./CompactProductCard";
import { MobileStylePicker } from "./MobileStylePicker";
import { useShoppingTools } from "../../context/ShoppingToolsContext";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/currency";
import { useAuth } from "../../context/AuthContext";
import type { Product } from "../../types/catalog";

type Props = {
  search: string;
  submittedSearch: string;
  onClearSearch: () => void;
  requestedCategory: { name: string; token: number };
};

function PersonalProductRail({
  eyebrow,
  title,
  subtitle,
  products,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  products: Product[];
}) {
  return (
    <section className="mt-10 border-y border-neutral-200 bg-white py-7">
      <div className="mb-6 flex items-end justify-between gap-5">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[.22em] text-neutral-500">{eyebrow}</p>
          <h3 className="mt-2 font-serif text-3xl font-semibold">{title}</h3>
        </div>
        <span className="hidden text-xs text-neutral-500 sm:block">{subtitle}</span>
      </div>
      <div className="grid auto-cols-[minmax(260px,320px)] grid-flow-col gap-3 overflow-x-auto pb-3">
        {products.map((product) => <CompactProductCard key={product.id} product={product}/>)}
      </div>
    </section>
  );
}

export function Catalog({ search, submittedSearch, onClearSearch, requestedCategory }: Props) {
  const [category, setCategory] = useState(""),
    [subcategory, setSubcategory] = useState(""),
    [brand, setBrand] = useState(""),
    [order, setOrder] = useState("nombre_asc"),
    [page, setPage] = useState(1);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [quickMode, setQuickMode] = useState(false);
  const [quickQuantities, setQuickQuantities] = useState<
    Record<number, number>
  >({});
  const tools = useShoppingTools(),
    cart = useCart();
  const { user } = useAuth();
  const filters = useCatalogFilters();
  const products = useProducts({
    buscar: submittedSearch,
    categoriaId: category,
    subcategoriaId: subcategory,
    marcaId: brand,
    orden: order,
    page,
  });
  const update = (callback: () => void) => {
    callback();
    setPage(1);
  };
  const clear = () => {
    setCategory("");
    setSubcategory("");
    setBrand("");
    setPage(1);
    onClearSearch();
  };

  useEffect(() => {
    if (submittedSearch) setMobileExpanded(true);
  }, [submittedSearch]);

  useEffect(() => {
    if (!requestedCategory.name || !filters.data) return;
    const normalize = (value: string) =>
      value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
    const normalized = normalize(requestedCategory.name);
    const match = filters.data.categorias.find((item) =>
      normalize(item.nombre).includes(normalized),
    );
    if (!match) return;
    setCategory(String(match.id));
    setSubcategory("");
    setPage(1);
    setMobileExpanded(true);
  }, [requestedCategory, filters.data]);

  const showProducts = () => {
    setMobileExpanded(true);
    window.requestAnimationFrame(() =>
      document
        .getElementById("productos-grid")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  return (
    <section
      id="catalogo"
      className="relative overflow-hidden bg-white px-4 py-16 sm:px-6 lg:px-[7vw] lg:py-28"
    >
      <div className="pointer-events-none absolute -left-32 top-40 size-80 rounded-full bg-neutral-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-24 size-72 rounded-full bg-neutral-100/60 blur-3xl" />
      <div className="relative mx-auto max-w-360">
        <header className="mb-10 !min-h-0 !flex-nowrap !border-0 !bg-transparent !p-0">
          <div className="max-w-180">
            <p className="mb-3 text-[10px] font-semibold tracking-[0.25em] text-neutral-500">
              COLECCIÓN MAYORISTA
            </p>
            <h2 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-neutral-950 sm:text-6xl">
              Elegí tu próxima
              <br />
              <span className="italic font-normal text-neutral-500">
                colección.
              </span>
            </h2>
            <p className="mt-4 max-w-150 text-sm leading-6 text-neutral-500 sm:text-base">
              Descubrí bikinis, pijamas y lencería seleccionados para potenciar
              tu negocio.
            </p>
          </div>
          <div className="ml-auto hidden size-50 items-center justify-center rounded-full border border-neutral-300 bg-neutral-50 text-center text-[12px] font-semibold leading-10 tracking-[.2em] text-neutral-700 md:flex">
            VENTA
            <br />
            100%
            <br />
            MAYORISTA
          </div>
        </header>

        <div className="hidden md:block">
          <CatalogFilters
            filters={filters.data}
            hasError={filters.isError}
            category={category}
            subcategory={subcategory}
            brand={brand}
            hasActive={Boolean(
              category || subcategory || brand || search || submittedSearch,
            )}
            onCategory={(value) =>
              update(() => {
                setCategory(value);
                setSubcategory("");
              })
            }
            onSubcategory={(value) => update(() => setSubcategory(value))}
            onBrand={(value) => update(() => setBrand(value))}
            onClear={clear}
          />
        </div>

        <MobileStylePicker
          categories={filters.data?.categorias}
          selectedCategory={category}
          onSelect={(value) => {
            update(() => {
              setCategory(value);
              setSubcategory("");
            });
            setMobileExpanded(true);
          }}
        />

        {user && tools.favorites.length > 0 && <PersonalProductRail eyebrow="TU SELECCIÓN" title="Mis favoritos" subtitle="Tus elegidos siempre a mano" products={tools.favorites}/>}
        {user && tools.recent.length > 0 && <PersonalProductRail eyebrow="TU RECORRIDO" title="Vistos recientemente" subtitle="Retomá donde lo dejaste" products={tools.recent}/>}

        {!mobileExpanded && (
          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center gap-3 bg-neutral-800 px-5 py-4 text-xs font-bold uppercase tracking-[.12em] text-white md:hidden"
            onClick={() => {
              clear();
              showProducts();
            }}
          >
            Ver todos los productos <span aria-hidden="true">↓</span>
          </button>
        )}

        <div className={`${mobileExpanded ? "block" : "hidden"} md:block`}>
          <div
            id="productos-grid"
            className="mb-7 mt-12 scroll-mt-40 flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-500">
                CATÁLOGO ONLINE
              </p>
              <h3 className="mt-1 font-serif text-3xl font-semibold">
                {submittedSearch
                  ? `Resultados para “${submittedSearch}”`
                  : category
                    ? filters.data?.categorias.find((item) => String(item.id) === category)?.nombre || "Productos"
                    : "Todos los productos"}
              </h3>
              <span className="mt-1 block text-sm text-neutral-500">
                {products.data?.total ?? 0} opciones para tu próxima compra
              </span>
            </div>
            <div className="flex gap-2">
              <button
                className="h-11 rounded-xl border border-[#e5e5e5] bg-white px-4 text-xs font-bold"
                onClick={() => setQuickMode((v) => !v)}
              >
                {quickMode ? "Ver tarjetas" : "Carga rápida"}
              </button>
              <label className="flex items-center gap-3 text-xs font-bold text-[#737373]">
                Ordenar
                <select
                  className="h-11 rounded-xl border border-[#e5e5e5] bg-white px-4 text-sm font-medium outline-none focus:border-[#525252]"
                  value={order}
                  onChange={(event) =>
                    update(() => setOrder(event.target.value))
                  }
                >
                  <option value="nombre_asc">Nombre A–Z</option>
                  <option value="nombre_desc">Nombre Z–A</option>
                  <option value="precio_asc">Menor precio</option>
                  <option value="precio_desc">Mayor precio</option>
                </select>
              </label>
            </div>
          </div>

          {products.isLoading && (
            <div className="grid min-h-80 place-items-center content-center gap-4 text-[#737373]">
              <span className="size-9 animate-spin rounded-full border-3 border-neutral-200 border-t-[#111111]" />
              <h3 className="font-bold">Preparando la colección…</h3>
            </div>
          )}
          {products.isError && (
            <div className="grid min-h-80 place-items-center content-center gap-3 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-neutral-200 text-xl font-bold text-neutral-700">
                !
              </span>
              <h3 className="text-lg font-bold">
                No pudimos cargar la colección
              </h3>
              <p className="text-sm text-gray-500">{products.error.message}</p>
              <button
                className="rounded-full bg-[#111111] px-5 py-2.5 font-bold text-white"
                onClick={() => products.refetch()}
              >
                Reintentar
              </button>
            </div>
          )}
          {!products.isLoading &&
            !products.isError &&
            products.data?.items.length === 0 && (
              <div className="grid min-h-80 place-items-center content-center gap-3 text-center">
                <span className="text-4xl">⌕</span>
                <h3 className="text-lg font-bold">No encontramos productos</h3>
                <p className="text-sm text-gray-500">
                  Probá cambiando la búsqueda o los filtros.
                </p>
                <button
                  className="font-bold text-[#111111] underline"
                  onClick={clear}
                >
                  Ver toda la colección
                </button>
              </div>
            )}

          {quickMode ? (
            <div className="overflow-x-auto rounded-2xl border bg-white">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-left">
                  <tr>
                    <th className="p-3">Producto</th>
                    <th>Stock</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.data?.items.map((product) => (
                    <tr className="border-t" key={product.id}>
                      <td className="p-3">
                        <strong>{product.nombre}</strong>
                        <small className="block text-gray-400">
                          {product.dux_codigo}
                        </small>
                      </td>
                      <td>{Number(product.stock_disponible)}</td>
                      <td>
                        {product.precio_mayorista
                          ? formatCurrency(Number(product.precio_mayorista))
                          : "—"}
                      </td>
                      <td>
                        <input
                          className="w-20 rounded-lg border p-2"
                          type="number"
                          min="1"
                          max={Math.floor(Number(product.stock_disponible))}
                          value={quickQuantities[product.id] ?? 1}
                          onChange={(e) =>
                            setQuickQuantities((q) => ({
                              ...q,
                              [product.id]: Number(e.target.value),
                            }))
                          }
                        />
                      </td>
                      <td className="p-3">
                        <button
                          className="rounded-lg bg-[#111111] px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
                          disabled={
                            !product.tiene_stock || !product.precio_mayorista
                          }
                          onClick={() =>
                            cart.addItem(
                              product,
                              quickQuantities[product.id] ?? 1,
                            )
                          }
                        >
                          Agregar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${products.isFetching ? "opacity-50" : ""}`}
            >
              {products.data?.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          {products.data && products.data.total_paginas > 1 && (
            <nav
              className="mt-12 flex items-center justify-center gap-3"
              aria-label="Paginación"
            >
              <button
                className="rounded-full border border-[#e5e5e5] bg-white px-5 py-2.5 text-sm font-bold disabled:opacity-40"
                disabled={page === 1}
                onClick={() => setPage((value) => value - 1)}
              >
                ← Anterior
              </button>
              <span className="px-2 text-sm text-[#737373]">
                {page} / {products.data.total_paginas}
              </span>
              <button
                className="rounded-full border border-[#e5e5e5] bg-white px-5 py-2.5 text-sm font-bold disabled:opacity-40"
                disabled={page >= products.data.total_paginas}
                onClick={() => setPage((value) => value + 1)}
              >
                Siguiente →
              </button>
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
