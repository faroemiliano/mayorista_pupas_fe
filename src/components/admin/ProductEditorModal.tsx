import { useEffect, useState, type FormEvent } from "react";
import { apiAsset } from "../../api/client";
import {
  createAdminProduct,
  deleteAdminProductImage,
  getAdminProduct,
  setAdminProductMainImage,
  updateAdminProduct,
  uploadAdminProductImage,
  type ProductEditorPayload,
} from "../../api/admin";
import type { CatalogFilters, Product } from "../../types/catalog";

type Props = {
  product: Product | null;
  filters?: CatalogFilters;
  onClose: () => void;
  onSaved: () => void;
};
type SizeRow = {
  talle: string;
  cantidad: number;
  disponible: number;
  reservado: number;
  agregar: number;
};
type PendingImage = { file: File; preview: string; principal: boolean };
const input =
  "mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-2 focus:ring-neutral-200";
const emptySize = (): SizeRow => ({
  talle: "",
  cantidad: 0,
  disponible: 0,
  reservado: 0,
  agregar: 0,
});
const rowsFromProduct = (value: Product | null): SizeRow[] =>
  value?.talles?.map((item) => ({
    talle: item.talle,
    cantidad: item.cantidad,
    disponible: item.disponible,
    reservado: Math.max(item.cantidad - item.disponible, 0),
    agregar: 0,
  })) || [emptySize()];

export function ProductEditorModal({
  product,
  filters,
  onClose,
  onSaved,
}: Props) {
  const [detail, setDetail] = useState<Product | null>(product);
  const [category, setCategory] = useState(
    product?.categoria?.id ? String(product.categoria.id) : "",
  );
  const [sizes, setSizes] = useState<SizeRow[]>(rowsFromProduct(product));
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (!product) return;
    getAdminProduct(product.id)
      .then((value) => {
        setDetail(value);
        setCategory(value.categoria?.id ? String(value.categoria.id) : "");
        setSizes(rowsFromProduct(value));
      })
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "No se pudo cargar el producto.",
        ),
      );
  }, [product]);
  useEffect(
    () => () =>
      pendingImages.forEach((item) => URL.revokeObjectURL(item.preview)),
    [pendingImages],
  );
  const subcategories =
    filters?.categorias.find((item) => String(item.id) === category)
      ?.subcategorias || [];
  const totalDisponible = sizes.reduce(
    (total, item) => total + item.disponible + Math.max(item.agregar, 0),
    0,
  );
  const totalReservado = sizes.reduce(
    (total, item) => total + item.reservado,
    0,
  );
  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = [...files].filter(
      (file) =>
        ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type,
        ) && file.size <= 8 * 1024 * 1024,
    );
    setPendingImages((current) => [
      ...current,
      ...valid.map((file, index) => ({
        file,
        preview: URL.createObjectURL(file),
        principal: !detail?.imagenes?.length && !current.length && index === 0,
      })),
    ]);
  };
  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const cleanSizes = sizes.filter((item) => item.talle.trim());
    if (!cleanSizes.length) {
      setError("Agregá al menos un talle.");
      setSaving(false);
      return;
    }
    const payload: ProductEditorPayload = {
      codigo: String(data.get("codigo")).trim(),
      nombre: String(data.get("nombre")).trim(),
      descripcion: String(data.get("descripcion")).trim() || null,
      categoria_id: category ? Number(category) : null,
      subcategoria_id: data.get("subcategoria_id")
        ? Number(data.get("subcategoria_id"))
        : null,
      marca_id: data.get("marca_id") ? Number(data.get("marca_id")) : null,
      precio_mayorista: Number(data.get("precio_mayorista")),
      precio_24_productos: data.get("precio_24_productos")
        ? Number(data.get("precio_24_productos"))
        : null,
      cantidad_unidades_por_bulto: data.get("cantidad_unidades_por_bulto")
        ? Number(data.get("cantidad_unidades_por_bulto"))
        : null,
      talles: cleanSizes.map((item) => ({
        talle: item.talle,
        cantidad: item.cantidad + Math.max(item.agregar, 0),
      })),
      habilitado: data.get("habilitado") === "on",
      visible_tienda: data.get("visible_tienda") === "on",
    };
    try {
      const saved = detail
        ? await updateAdminProduct(detail.id, payload)
        : await createAdminProduct(payload);
      for (const image of pendingImages) {
        await uploadAdminProductImage(saved.id, {
          nombre: image.file.name,
          media_type: image.file.type,
          contenido_base64: await toBase64(image.file),
          principal: image.principal,
        });
      }
      onSaved();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No se pudo guardar el producto.",
      );
    } finally {
      setSaving(false);
    }
  };
  const removeExisting = async (imageId: number) => {
    if (!detail || !window.confirm("¿Quitar esta foto del producto?")) return;
    try {
      await deleteAdminProductImage(detail.id, imageId);
      setDetail({
        ...detail,
        imagenes: detail.imagenes?.filter((item) => item.id !== imageId),
      });
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "No se pudo quitar la foto.",
      );
    }
  };
  const makeMain = async (imageId: number) => {
    if (!detail) return;
    try {
      await setAdminProductMainImage(detail.id, imageId);
      setDetail({
        ...detail,
        imagenes: detail.imagenes?.map((item) => ({
          ...item,
          principal: item.id === imageId,
        })),
      });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No se pudo cambiar la foto principal.",
      );
    }
  };
  const updateSize = (index: number, changes: Partial<SizeRow>) =>
    setSizes((current) =>
      current.map((item, i) => (i === index ? { ...item, ...changes } : item)),
    );
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/65 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-[#f7f7f5] shadow-2xl">
        <header className="flex items-start justify-between border-b border-neutral-200 bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.2em] text-neutral-400">
              CATÁLOGO DE LA TIENDA
            </p>
            <h2 className="mt-1 font-serif text-3xl font-semibold">
              {detail ? "Editar producto" : "Crear producto"}
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Los productos web podrán vincularse con Dux utilizando el mismo
              código.
            </p>
          </div>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full bg-neutral-100 text-2xl"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <form className="overflow-y-auto" onSubmit={submit}>
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              <section className="rounded-xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold">Información principal</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-bold">
                    Nombre
                    <input
                      className={input}
                      name="nombre"
                      required
                      minLength={2}
                      defaultValue={detail?.nombre}
                    />
                  </label>
                  <label className="text-xs font-bold">
                    Código / SKU{" "}
                    <span className="font-normal text-neutral-400">
                      (opcional)
                    </span>
                    <input
                      className={input}
                      name="codigo"
                      placeholder="Se genera automáticamente"
                      defaultValue={detail?.dux_codigo}
                    />
                  </label>
                </div>
                <label className="mt-4 block text-xs font-bold">
                  Descripción
                  <textarea
                    className={`${input} min-h-28 resize-y`}
                    name="descripcion"
                    defaultValue={detail?.descripcion || ""}
                  />
                </label>
              </section>
              <section className="rounded-xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold">Categoría y marca</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <label className="text-xs font-bold">
                    Categoría
                    <select
                      className={input}
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                    >
                      <option value="">Sin categoría</option>
                      {filters?.categorias.map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-bold">
                    Subcategoría
                    <select
                      className={input}
                      name="subcategoria_id"
                      defaultValue={detail?.subcategoria?.id || ""}
                    >
                      <option value="">Sin subcategoría</option>
                      {subcategories.map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-bold">
                    Marca
                    <select
                      className={input}
                      name="marca_id"
                      defaultValue={detail?.marca?.id || ""}
                    >
                      <option value="">Sin marca</option>
                      {filters?.marcas.map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>
              <section className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold">Talles y existencias</h3>
                    <p className="mt-1 text-xs text-neutral-500">
                      Disponible: {totalDisponible} · Reservado:{" "}
                      {totalReservado}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg bg-neutral-100 px-3 py-2 text-xs font-bold"
                    onClick={() =>
                      setSizes((current) => [...current, emptySize()])
                    }
                  >
                    + Talle
                  </button>
                </div>
                <p className="mt-3 text-xs leading-5 text-neutral-500">
                  Al agregar al carrito, la unidad queda reservada
                  temporalmente. Para reponer mercadería, usá “Sumar”: no
                  reemplaza el stock existente.
                </p>
                <div className="mt-4 space-y-2 overflow-x-auto pb-1">
                  {sizes.map((row, index) => (
                    <div
                      className="grid min-w-[410px] grid-cols-[110px_78px_78px_98px_28px] items-end gap-2"
                      key={index}
                    >
                      <label className="text-[9px] font-bold uppercase text-neutral-500">Talle<input className={`${input} mt-0`} placeholder="Ej: M" value={row.talle} onChange={(event) => updateSize(index, { talle: event.target.value })} /></label>
                      <div className="mt-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-2 text-center text-xs">
                        <span className="block text-[9px] uppercase text-neutral-400">
                          Disponible
                        </span>
                        <b>{row.disponible + Math.max(row.agregar, 0)}</b>
                      </div>
                      <div className="mt-1.5 rounded-lg border border-amber-100 bg-amber-50 px-2 py-2 text-center text-xs">
                        <span className="block text-[9px] uppercase text-amber-600">
                          Reservado
                        </span>
                        <b>{row.reservado}</b>
                      </div>
                      <label className="text-[9px] font-bold uppercase text-neutral-500">
                        Sumar
                        <input
                          className={`${input} mt-0`}
                          aria-label="Unidades a agregar"
                          type="number"
                          min="0"
                          value={row.agregar || ""}
                          placeholder="0"
                          onChange={(event) =>
                            updateSize(index, {
                              agregar: Math.max(
                                Number(event.target.value) || 0,
                                0,
                              ),
                            })
                          }
                        />
                      </label>
                      <button
                        type="button"
                        className="mt-2 text-xl text-neutral-400"
                        aria-label="Quitar talle"
                        onClick={() =>
                          setSizes((current) =>
                            current.filter((_, i) => i !== index),
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <aside className="space-y-6">
              <section className="rounded-xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold">Precios</h3>
                <label className="mt-4 block text-xs font-bold">
                  Precio mayorista
                  <input
                    className={input}
                    required
                    min="0.01"
                    step="0.01"
                    type="number"
                    name="precio_mayorista"
                    defaultValue={detail?.precio_mayorista || ""}
                  />
                </label>
                <label className="mt-4 block text-xs font-bold">
                  Precio por 24 productos
                  <input
                    className={input}
                    min="0.01"
                    step="0.01"
                    type="number"
                    name="precio_24_productos"
                    defaultValue={detail?.precio_24_productos || ""}
                  />
                </label>
                <label className="mt-4 block text-xs font-bold">
                  Unidades por bulto
                  <input
                    className={input}
                    min="0"
                    step="1"
                    type="number"
                    name="cantidad_unidades_por_bulto"
                    defaultValue={detail?.cantidad_unidades_por_bulto || ""}
                  />
                </label>
              </section>
              <section className="rounded-xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold">Fotos</h3>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {detail?.imagenes?.map((image) => (
                    <div
                      className={`relative aspect-[3/4] overflow-hidden border-2 ${image.principal ? "border-black" : "border-transparent"}`}
                      key={image.id}
                    >
                      <img
                        className="h-full w-full object-cover"
                        src={apiAsset(
                          `/api/productos/${detail.id}/imagenes/${image.id}`,
                        )}
                        alt=""
                      />
                      <button
                        type="button"
                        className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-white text-sm shadow"
                        onClick={() => removeExisting(image.id)}
                      >
                        ×
                      </button>
                      {!image.principal && (
                        <button
                          type="button"
                          className="absolute inset-x-1 bottom-1 bg-white/90 py-1 text-[7px] font-bold uppercase"
                          onClick={() => makeMain(image.id)}
                        >
                          Principal
                        </button>
                      )}
                    </div>
                  ))}
                  {pendingImages.map((image, index) => (
                    <div
                      className={`relative aspect-[3/4] overflow-hidden border-2 ${image.principal ? "border-black" : "border-transparent"}`}
                      key={image.preview}
                    >
                      <img
                        className="h-full w-full object-cover"
                        src={image.preview}
                        alt=""
                      />
                      <button
                        type="button"
                        className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-white text-sm shadow"
                        onClick={() =>
                          setPendingImages((current) =>
                            current.filter((_, i) => i !== index),
                          )
                        }
                      >
                        ×
                      </button>
                      <button
                        type="button"
                        className="absolute inset-x-1 bottom-1 bg-white/90 py-1 text-[7px] font-bold uppercase"
                        onClick={() =>
                          setPendingImages((current) =>
                            current.map((item, i) => ({
                              ...item,
                              principal: i === index,
                            })),
                          )
                        }
                      >
                        {image.principal ? "Principal" : "Elegir"}
                      </button>
                    </div>
                  ))}
                </div>
                <label className="mt-3 block cursor-pointer rounded-lg border border-dashed border-neutral-400 p-4 text-center text-xs font-bold">
                  + Subir fotografías
                  <input
                    className="hidden"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={(event) => addFiles(event.target.files)}
                  />
                </label>
                <p className="mt-2 text-[10px] leading-4 text-neutral-400">
                  JPG, PNG, WEBP o GIF. Máximo 8 MB por imagen.
                </p>
              </section>
              <section className="rounded-xl border border-neutral-200 bg-white p-5">
                <h3 className="font-bold">Publicación</h3>
                <label className="mt-4 flex items-center justify-between text-xs font-bold">
                  Producto habilitado
                  <input
                    className="size-4 accent-black"
                    type="checkbox"
                    name="habilitado"
                    defaultChecked={detail?.habilitado ?? true}
                  />
                </label>
                <label className="mt-4 flex items-center justify-between text-xs font-bold">
                  Visible en la tienda
                  <input
                    className="size-4 accent-black"
                    type="checkbox"
                    name="visible_tienda"
                    defaultChecked={detail?.visible_tienda ?? true}
                  />
                </label>
              </section>
            </aside>
          </div>
          {error && (
            <p className="mx-5 mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:mx-7">
              {error}
            </p>
          )}
          <footer className="sticky bottom-0 flex justify-end gap-3 border-t border-neutral-200 bg-white px-5 py-4 sm:px-7">
            <button
              type="button"
              className="rounded-lg border border-neutral-300 px-5 py-3 text-xs font-bold"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              disabled={saving}
              className="rounded-lg bg-black px-6 py-3 text-xs font-bold text-white disabled:opacity-50"
            >
              {saving
                ? "Guardando…"
                : detail
                  ? "Guardar cambios"
                  : "Crear producto"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
