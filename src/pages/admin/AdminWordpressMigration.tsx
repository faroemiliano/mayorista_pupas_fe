import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getDuxConfiguration,
  getImageMigrationDiagnostic,
  getImageMigrationExecution,
  getR2ImageMigrationDiagnostic,
  getR2ImageMigrationExecution,
  getProductReconciliation,
  getReconciliationCandidates,
  getWordpressMigrationExecution,
  getWordpressMigrationSummary,
  linkReconciliationCandidate,
  runWordpressMigration,
  runImageMigration,
  runProductR2ImageMigration,
  runR2ImageMigration,
  setDuxStockMode,
} from "../../api/admin";

const money = (value: string | null, currency = "ARS") => {
  if (!value) return "Sin precio";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(
    Number(value),
  );
};

const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Sin fecha";

export function AdminWordpressMigration() {
  const [candidatePage, setCandidatePage] = useState(1);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [r2ProductId, setR2ProductId] = useState("2001");
  const queryClient = useQueryClient();
  const summary = useQuery({
    queryKey: ["wordpress-migration-summary"],
    queryFn: getWordpressMigrationSummary,
  });
  const duxConfiguration = useQuery({ queryKey: ["dux-configuration"], queryFn: getDuxConfiguration });
  const reconciliation = useQuery({
    queryKey: ["wordpress-dux-reconciliation"],
    queryFn: getProductReconciliation,
  });
  const execution = useQuery({
    queryKey: ["wordpress-migration-execution"],
    queryFn: getWordpressMigrationExecution,
    refetchInterval: (query) =>
      query.state.data?.estado === "en_progreso" ? 3000 : false,
  });
  const imageExecution = useQuery({
    queryKey: ["image-migration-execution"],
    queryFn: getImageMigrationExecution,
    refetchInterval: (query) =>
      query.state.data?.estado === "en_progreso" ? 3000 : false,
  });
  const imageDiagnostic = useQuery({
    queryKey: ["image-migration-diagnostic"],
    queryFn: getImageMigrationDiagnostic,
    refetchInterval: imageExecution.data?.estado === "en_progreso" ? 3000 : false,
  });
  useEffect(() => {
    if (imageExecution.data?.estado === "completada") {
      void queryClient.invalidateQueries({ queryKey: ["image-migration-diagnostic"] });
    }
  }, [imageExecution.data?.estado, queryClient]);
  const ejecucionEstancada = execution.data?.estado === "en_progreso" && execution.data.actualizado_en
    ? Date.now() - new Date(execution.data.actualizado_en).getTime() > 120000
    : false;
  const runMigration = useMutation({
    mutationFn: (updateAll:boolean) => runWordpressMigration(updateAll),
    onSuccess: (data) =>
      queryClient.setQueryData(["wordpress-migration-execution"], data),
  });
  const runImages = useMutation({
    mutationFn: (limit: number | null) => runImageMigration(limit),
    onSuccess: async (data) => {
      queryClient.setQueryData(["image-migration-execution"], data);
      await queryClient.invalidateQueries({ queryKey: ["image-migration-diagnostic"] });
    },
  });
  const runR2Product = useMutation({
    mutationFn: (productoId: number) => runProductR2ImageMigration(productoId),
  });
  const r2Execution = useQuery({ queryKey: ["r2-image-migration-execution"], queryFn: getR2ImageMigrationExecution, refetchInterval: (query) => query.state.data?.estado === "en_progreso" ? 3000 : false });
  const r2Diagnostic = useQuery({ queryKey: ["r2-image-migration-diagnostic"], queryFn: getR2ImageMigrationDiagnostic, refetchInterval: r2Execution.data?.estado === "en_progreso" ? 3000 : false });
  const runR2All = useMutation({ mutationFn: runR2ImageMigration, onSuccess: async (data) => { queryClient.setQueryData(["r2-image-migration-execution"], data); await queryClient.invalidateQueries({ queryKey: ["r2-image-migration-diagnostic"] }); } });
  const toggleDux = useMutation({
    mutationFn: setDuxStockMode,
    onSuccess: (data) => queryClient.setQueryData(["dux-configuration"], data),
  });
  const candidates = useQuery({
    queryKey: ["wordpress-dux-candidates", candidatePage, candidateSearch],
    queryFn: () => getReconciliationCandidates(candidatePage, candidateSearch),
    enabled: reconciliation.data?.disponible === true,
  });
  const linkCandidate = useMutation({
    mutationFn: ({
      wordpressId,
      duxCode,
    }: {
      wordpressId: number;
      duxCode: string;
    }) => linkReconciliationCandidate(wordpressId, duxCode),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["wordpress-dux-candidates"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["wordpress-dux-reconciliation"],
        }),
      ]);
    },
  });

  if (summary.isLoading) return <p>Cargando copia de prueba…</p>;
  if (summary.isError || !summary.data)
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        No se pudo consultar la copia local de WordPress.
      </div>
    );
  const data = summary.data;

  return (
    <div className="space-y-6">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">MIGRACIÓN SEGURA</p>
          <h1>Copia de WordPress</h1>
          <span>
            Copia los datos de WordPress a la base propia de esta página.
          </span>
        </div>
        <div className="flex flex-wrap gap-3"><button
          className="rounded bg-black px-4 py-3 text-xs font-bold text-white disabled:opacity-40"
          disabled={runMigration.isPending || (execution.data?.estado === "en_progreso" && !ejecucionEstancada)}
          onClick={() => {
            if (
              window.confirm(
                ejecucionEstancada ? "La ejecución anterior quedó sin actividad. ¿Querés reanudarla?" : "¿Actualizar ahora todos los productos, clientes y pedidos desde WordPress? WordPress no será modificado y Dux permanecerá pausado.",
              )
            )
              runMigration.mutate(!ejecucionEstancada);
          }}
        >
          {execution.data?.estado === "en_progreso"
            ? ejecucionEstancada ? "Reanudar importación…" : "Importando…"
            : "Actualización final WordPress"}
        </button><button className={`rounded px-4 py-3 text-xs font-bold text-white disabled:opacity-40 ${duxConfiguration.data?.sincronizacion_habilitada ? 'bg-amber-700' : 'bg-emerald-700'}`} disabled={toggleDux.isPending} onClick={() => { const activo=duxConfiguration.data?.sincronizacion_habilitada===true; if(window.confirm(activo?'¿Volver a usar el stock temporal de WordPress?':'¿Usar Dux como fuente única del stock total? Los productos sin vínculo no tendrán stock.')) toggleDux.mutate(!activo) }}>{duxConfiguration.data?.sincronizacion_habilitada?'Pausar Dux':'Activar Dux como stock'}</button></div>
      </header>

      {toggleDux.isError&&<p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">No se pudo cambiar el modo Dux: {toggleDux.error.message}</p>}

      {execution.data?.estado === "en_progreso" && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>
            Importación en progreso:{" "}
            {execution.data.etapa?.replaceAll("_", " ")}
          </strong>
          <span className="mt-1 block">
            La copia continúa en segundo plano. No cierres ni reinicies el
            servicio de Render.
          </span>
        </div>
      )}
      {ejecucionEstancada && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>La ejecución anterior quedó sin actividad.</strong>
          <span className="mt-1 block">Podés reanudarla; se reutilizarán los datos ya copiados.</span>
        </div>
      )}
      {execution.data?.estado === "completada" && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <strong>La copia de WordPress terminó correctamente.</strong>
          <span className="mt-1 block">
            El catálogo anterior de Dux quedó oculto, no eliminado.
          </span>
        </div>
      )}
      {(execution.data?.estado === "error" || runMigration.isError) && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <strong>No se pudo completar la importación.</strong>
          <span className="mt-1 block">
            {execution.data?.error || runMigration.error?.message}
          </span>
        </div>
      )}

      <section className="rounded-md border border-neutral-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">INDEPENDENCIA DE WORDPRESS</p>
            <h2 className="mt-1 text-xl font-bold">Migración histórica de WordPress a Cloudinary</h2>
            <p className="mt-2 max-w-2xl text-sm text-neutral-600">
              Copia las fotos sin borrar ni modificar WordPress. La URL anterior queda guardada como respaldo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded border border-neutral-300 px-4 py-2.5 text-xs font-bold disabled:opacity-40"
              disabled={runImages.isPending || imageExecution.data?.estado === "en_progreso" || !imageDiagnostic.data?.wordpress}
              onClick={() => {
                if (window.confirm("Se copiarán solamente 10 fotos para revisar que cada producto conserve su imagen correcta. ¿Continuar?")) runImages.mutate(10);
              }}
            >
              Probar con 10 fotos
            </button>
            <button
              className="rounded bg-black px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"
              disabled={runImages.isPending || imageExecution.data?.estado === "en_progreso" || !imageDiagnostic.data?.wordpress}
              onClick={() => {
                if (window.confirm("Se copiarán todas las fotos pendientes a Cloudinary. WordPress no será modificado. ¿Continuar?")) runImages.mutate(null);
              }}
            >
              Migrar todas las imágenes
            </button>
          </div>
        </div>
        {imageDiagnostic.data && <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded bg-neutral-50 p-4"><small className="font-bold uppercase text-neutral-500">En Cloudinary</small><strong className="mt-1 block text-2xl">{imageDiagnostic.data.cloudinary}</strong></div>
          <div className="rounded bg-amber-50 p-4"><small className="font-bold uppercase text-amber-800">Aún dependen de WordPress</small><strong className="mt-1 block text-2xl">{imageDiagnostic.data.wordpress}</strong></div>
          <div className="rounded bg-neutral-50 p-4"><small className="font-bold uppercase text-neutral-500">Total de imágenes</small><strong className="mt-1 block text-2xl">{imageDiagnostic.data.total}</strong></div>
        </div>}
        {imageExecution.data?.estado === "en_progreso" && <p className="mt-4 rounded bg-blue-50 p-3 text-sm text-blue-900">Copiando imágenes en segundo plano… {String(imageExecution.data.progreso?.copiadas ?? 0)} completadas, {String(imageExecution.data.progreso?.fallidas ?? 0)} fallidas.</p>}
        {imageDiagnostic.data?.independiente_wordpress && <p className="mt-4 rounded bg-emerald-50 p-3 text-sm font-bold text-emerald-900">Listo: ninguna imagen del catálogo depende de WordPress.</p>}
        {(imageExecution.data?.estado === "error" || runImages.isError) && <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">{imageExecution.data?.error || runImages.error?.message || "No se pudo copiar las imágenes."}</p>}
      </section>

      <section className="rounded-md border border-sky-200 bg-sky-50 p-5">
        <p className="eyebrow">PRUEBA CONTROLADA R2</p>
        <h2 className="mt-1 text-xl font-bold">Copiar fotos de un solo producto</h2>
        <p className="mt-2 max-w-2xl text-sm text-neutral-700">
          Copia todas las fotos del producto al almacenamiento propio de Cloudflare R2. Las URLs actuales quedan guardadas como respaldo y no se borra nada de Cloudinary.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-xs font-bold text-neutral-700">ID del producto
            <input className="w-36 rounded border border-neutral-300 bg-white px-3 py-2 text-sm font-normal" inputMode="numeric" value={r2ProductId} onChange={(event) => setR2ProductId(event.target.value.replace(/\D/g, ""))} />
          </label>
          <button className="rounded bg-sky-700 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40" disabled={runR2Product.isPending || !Number(r2ProductId)} onClick={() => {
            const productoId = Number(r2ProductId);
            if (window.confirm(`¿Copiar a R2 todas las fotos del producto #${productoId}? Cloudinary quedará como respaldo.`)) runR2Product.mutate(productoId);
          }}>
            {runR2Product.isPending ? "Copiando fotos…" : "Copiar este producto a R2"}
          </button>
        </div>
        {runR2Product.data && <p className={`mt-4 rounded p-3 text-sm ${runR2Product.data.actualizado ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>
          <strong>{runR2Product.data.producto}:</strong> {runR2Product.data.copiadas} copiadas, {runR2Product.data.omitidas_r2} ya estaban en R2 y {runR2Product.data.fallidas} fallidas.
          {runR2Product.data.fallidas > 0 && " No se cambió ninguna URL para que puedas revisar el error."}
        </p>}
        {runR2Product.isError && <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">No se pudo copiar el producto: {runR2Product.error.message}</p>}
        <div className="mt-5 border-t border-sky-200 pt-4">
          {r2Diagnostic.data && <p className="mb-3 text-sm text-sky-900">Pendientes de migrar: <strong>{r2Diagnostic.data.total_pendientes}</strong> ({r2Diagnostic.data.imagenes_galeria_pendientes} de galería y {r2Diagnostic.data.principales_directas_pendientes} principales antiguas).</p>}
          <button className="rounded bg-black px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40" disabled={runR2All.isPending || r2Execution.data?.estado === "en_progreso"} onClick={() => { if (window.confirm("¿Iniciar la copia gradual de todas las imágenes a R2? Se procesarán de a cinco, sin borrar Cloudinary y podés volver a esta pantalla para ver el avance.")) runR2All.mutate(); }}>
            {r2Execution.data?.estado === "en_progreso" ? "Migrando todas las fotos…" : "Migrar todas las imágenes a R2"}
          </button>
          {r2Execution.data?.estado === "en_progreso" && <p className="mt-3 text-sm text-sky-900">Avance: {String(r2Execution.data.progreso?.copiadas ?? 0)} copiadas, {String(r2Execution.data.progreso?.fallidas ?? 0)} fallidas.</p>}
          {r2Execution.data?.estado === "completada" && <p className="mt-3 text-sm text-emerald-900">Migración terminada: {String(r2Execution.data.resultado?.copiadas ?? 0)} copiadas y {String(r2Execution.data.resultado?.fallidas ?? 0)} fallidas.</p>}
          {(r2Execution.data?.estado === "error" || runR2All.isError) && <p className="mt-3 text-sm text-red-800">{r2Execution.data?.error || runR2All.error?.message || "No se pudo iniciar la migración."}</p>}
        </div>
      </section>

      <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <strong>WordPress sigue funcionando normalmente.</strong>
        <span className="mt-1 block">
          Esta pantalla no modifica WordPress, Dux ni el catálogo público.
        </span>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        {(
          [
            ["Productos", data.totales.productos],
            ["Clientes", data.totales.clientes],
            ["Pedidos", data.totales.pedidos],
          ] as const
        ).map(([label, total]) => (
          <article
            key={label}
            className="border border-neutral-200 bg-white p-5"
          >
            <small className="text-[10px] font-bold uppercase tracking-[.16em] text-neutral-500">
              {label} copiados
            </small>
            <strong className="mt-2 block text-3xl">{total}</strong>
          </article>
        ))}
      </section>

      {reconciliation.data?.disponible && reconciliation.data.totales && (
        <section className="space-y-3 border border-neutral-200 bg-white p-5">
          <div>
            <p className="eyebrow">WORDPRESS ↔ DUX</p>
            <h2 className="text-xl font-bold">Conciliación de productos</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Las relaciones aprobadas se guardan localmente. WordPress y Dux
              permanecen sin modificaciones.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <p>
              <strong className="block text-2xl text-emerald-700">
                {reconciliation.data.totales.vinculados}
              </strong>
              <span className="text-xs text-neutral-500">Ya vinculados</span>
            </p>
            <p>
              <strong className="block text-2xl">
                {reconciliation.data.totales.coincidencias}
              </strong>
              <span className="text-xs text-neutral-500">
                Coincidencias seguras
              </span>
            </p>
            <p>
              <strong className="block text-2xl text-amber-700">
                {candidates.data?.total ?? reconciliation.data.totales.dudosos}
              </strong>
              <span className="text-xs text-neutral-500">
                Pendientes manuales
              </span>
            </p>
            <p>
              <strong className="block text-2xl">
                {reconciliation.data.totales.solo_wordpress}
              </strong>
              <span className="text-xs text-neutral-500">
                Sólo en WordPress
              </span>
            </p>
            <p>
              <strong className="block text-2xl">
                {reconciliation.data.totales.solo_dux}
              </strong>
              <span className="text-xs text-neutral-500">Sólo en Dux</span>
            </p>
          </div>
          {reconciliation.data.totales.dux_omitidos_por_error > 0 && (
            <p className="rounded bg-amber-50 p-3 text-xs text-amber-900">
              Dux informó {reconciliation.data.totales.dux_informados}{" "}
              productos, pero{" "}
              {reconciliation.data.totales.dux_omitidos_por_error} no pudieron
              leerse por un error de formato de su API. No se tomarán decisiones
              sobre ellos.
            </p>
          )}
        </section>
      )}

      {reconciliation.data?.disponible && (
        <section className="space-y-4 border border-neutral-200 bg-white p-5">
          <div>
            <p className="eyebrow">REVISIÓN MANUAL</p>
            <h2 className="text-xl font-bold">Coincidencias dudosas</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Compará nombre, foto, precio, código y talles. Vincular sólo
              guarda la relación en esta página.
            </p>
          </div>
          <input
            className="admin-filter w-full max-w-lg"
            placeholder="Buscar producto o código…"
            value={candidateSearch}
            onChange={(event) => {
              setCandidateSearch(event.target.value);
              setCandidatePage(1);
            }}
          />
          {candidates.isLoading ? (
            <p className="text-sm text-neutral-500">Cargando candidatos…</p>
          ) : !candidates.data?.items.length ? (
            <p className="rounded bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
              No quedan coincidencias dudosas pendientes.
            </p>
          ) : (
            <div className="space-y-3">
              {candidates.data.items.map((item) => (
                <article
                  className="grid gap-4 border border-neutral-200 p-4 lg:grid-cols-[1fr_1fr_auto] lg:items-center"
                  key={item.wordpress_id}
                >
                  <div className="grid grid-cols-[80px_1fr] gap-3">
                    {item.wordpress_imagen ? (
                      <img
                        className="aspect-square w-20 object-cover"
                        src={item.wordpress_imagen}
                        alt=""
                      />
                    ) : (
                      <div className="grid size-20 place-items-center bg-neutral-100 text-[9px]">
                        Sin foto
                      </div>
                    )}
                    <div>
                      <small className="text-[10px] font-bold uppercase text-neutral-500">
                        WordPress #{item.wordpress_id}
                      </small>
                      <strong className="block">{item.wordpress_nombre}</strong>
                      <span className="mt-1 block text-xs">
                        Precios:{" "}
                        {item.wordpress_precios
                          .map((value) => money(String(value)))
                          .join(" · ") || "Sin precio"}
                      </span>
                      <span className="block text-xs text-neutral-500">
                        Talles:{" "}
                        {item.wordpress_talles.join(", ") || "Sin datos"} · SKU:{" "}
                        {item.wordpress_skus.join(", ") || "Sin SKU"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-3">
                    {item.dux_imagen ? (
                      <img
                        className="aspect-square w-20 object-cover"
                        src={item.dux_imagen}
                        alt=""
                      />
                    ) : (
                      <div className="grid size-20 place-items-center bg-neutral-100 text-[9px]">
                        Sin foto
                      </div>
                    )}
                    <div>
                      <small className="text-[10px] font-bold uppercase text-neutral-500">
                        Dux {item.dux_codigo_sugerido} · similitud{" "}
                        {Math.round(item.similitud * 100)}%
                      </small>
                      <strong className="block">
                        {item.dux_nombre_sugerido}
                      </strong>
                      <span className="mt-1 block text-xs">
                        Precios:{" "}
                        {item.dux_precios
                          .map(
                            (value) =>
                              `${value.nombre || "Lista"} ${money(String(value.precio))}`,
                          )
                          .join(" · ") || "Sin precio"}
                      </span>
                      <span className="block text-xs text-neutral-500">
                        Talles: {item.dux_talles.join(", ") || "Sin datos"}
                      </span>
                      {item.motivo && (
                        <span className="mt-1 block text-xs text-amber-700">
                          {item.motivo}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="bg-black px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
                    disabled={linkCandidate.isPending || Boolean(item.motivo)}
                    onClick={() => {
                      if (
                        window.confirm(
                          `¿Confirmás que “${item.wordpress_nombre}” y “${item.dux_nombre_sugerido}” son el mismo producto?`,
                        )
                      )
                        linkCandidate.mutate({
                          wordpressId: Number(item.wordpress_id),
                          duxCode: item.dux_codigo_sugerido,
                        });
                    }}
                  >
                    Vincular
                  </button>
                </article>
              ))}
            </div>
          )}
          {candidates.data && candidates.data.total_paginas > 1 && (
            <nav className="pagination">
              <button
                disabled={candidatePage === 1}
                onClick={() => setCandidatePage((value) => value - 1)}
              >
                ← Anterior
              </button>
              <span>
                Página {candidatePage} de {candidates.data.total_paginas}
              </span>
              <button
                disabled={candidatePage >= candidates.data.total_paginas}
                onClick={() => setCandidatePage((value) => value + 1)}
              >
                Siguiente →
              </button>
            </nav>
          )}
          {linkCandidate.isError && (
            <p className="text-sm text-red-700">
              {linkCandidate.error.message}
            </p>
          )}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Producto de prueba</h2>
        {data.productos.map((product) => (
          <article
            key={product.id}
            className="grid gap-5 border border-neutral-200 bg-white p-5 sm:grid-cols-[120px_1fr]"
          >
            {product.imagen ? (
              <img
                className="aspect-square w-full object-cover"
                src={product.imagen}
                alt={product.nombre}
              />
            ) : (
              <div className="grid aspect-square place-items-center bg-neutral-100 text-xs text-neutral-500">
                Sin imagen
              </div>
            )}
            <div>
              <small className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                WooCommerce #{product.id} · {product.estado}
              </small>
              <h3 className="mt-1 text-xl font-bold">{product.nombre}</h3>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <p>
                  <strong className="block">Variaciones</strong>
                  {product.cantidad_variaciones}
                </p>
                <p>
                  <strong className="block">Talles</strong>
                  {product.talles.join(", ") || "Sin talles"}
                </p>
                <p>
                  <strong className="block">Stock total</strong>
                  {product.stock_total}
                </p>
              </div>
              <p className="mt-3 text-sm">
                <strong>Precios:</strong>{" "}
                {product.precios_variaciones
                  .map((value) => money(value))
                  .join(" · ") || money(product.precio)}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-bold">Últimos clientes copiados</h2>
          <p className="text-xs text-neutral-500">
            Vista previa de {data.clientes.length} sobre {data.totales.clientes}{" "}
            registros.
          </p>
        </div>
        {data.clientes.map((client) => (
          <article
            key={client.id}
            className="border border-neutral-200 bg-white p-5"
          >
            <small className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              WooCommerce #{client.id}
            </small>
            <h3 className="mt-1 text-lg font-bold">
              {client.nombre || "Sin nombre"}
            </h3>
            <p className="mt-2 text-sm">{client.email}</p>
            <p className="text-sm text-neutral-600">
              {client.telefono || "Sin teléfono"} ·{" "}
              {[client.localidad, client.provincia]
                .filter(Boolean)
                .join(", ") || "Sin localidad"}
            </p>
            <p className="mt-2 text-xs text-neutral-500">
              Dirección:{" "}
              {client.tiene_direccion ? "disponible" : "no informada"} · Alta:{" "}
              {date(client.creado_en)}
            </p>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-bold">Últimos pedidos copiados</h2>
          <p className="text-xs text-neutral-500">
            Vista previa de {data.pedidos.length} sobre {data.totales.pedidos}{" "}
            registros.
          </p>
        </div>
        {data.pedidos.map((order) => (
          <article
            key={order.id}
            className="border border-neutral-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <small className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  WooCommerce #{order.id}
                </small>
                <h3 className="mt-1 text-lg font-bold">
                  Pedido {order.numero || order.id}
                </h3>
              </div>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold uppercase">
                {order.estado}
              </span>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
              <p>
                <strong className="block">Fecha</strong>
                {date(order.fecha)}
              </p>
              <p>
                <strong className="block">Cliente</strong>#{order.cliente_id}
              </p>
              <p>
                <strong className="block">Artículos</strong>
                {order.cantidad_items} ({order.cantidad_unidades} unidades)
              </p>
              <p>
                <strong className="block">Total</strong>
                {money(order.total, order.moneda || "ARS")}
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
