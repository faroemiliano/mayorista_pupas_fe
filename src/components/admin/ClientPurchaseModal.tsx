import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { getClientPurchaseBalance } from "../../api/admin";
import { formatCurrency } from "../../utils/currency";

export type ClientPurchaseModalClient = {
  id: number;
  nombre: string;
  apellido?: string | null;
  email?: string | null;
};

type PurchaseSummary = {
  pedidos: number;
  unidades: number;
  importe: number;
};

export function ClientPurchaseModal({
  client,
  onClose,
}: {
  client: ClientPurchaseModalClient;
  onClose: () => void;
}) {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [periodo, setPeriodo] = useState({ desde: "", hasta: "" });
  const balance = useQuery({
    queryKey: ["client-purchase-balance", client.id, periodo.desde, periodo.hasta],
    queryFn: () => getClientPurchaseBalance(client.id, periodo.desde, periodo.hasta),
  });
  const resumen = balance.data?.periodo ?? { pedidos: 0, unidades: 0, importe: 0 };

  const aplicarPeriodo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPeriodo({ desde, hasta });
  };
  const limpiarPeriodo = () => {
    setDesde("");
    setHasta("");
    setPeriodo({ desde: "", hasta: "" });
  };
  const cards = (titulo: string, datos: PurchaseSummary) => (
    <section>
      <h3 className="text-sm font-bold">{titulo}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-neutral-100 p-4"><small className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Pedidos</small><strong className="mt-1 block text-2xl">{datos.pedidos}</strong></div>
        <div className="rounded-xl bg-neutral-100 p-4"><small className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Productos</small><strong className="mt-1 block text-2xl">{datos.unidades}</strong></div>
        <div className="rounded-xl bg-neutral-100 p-4"><small className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Gastado</small><strong className="mt-1 block text-2xl">{formatCurrency(datos.importe)}</strong></div>
      </div>
    </section>
  );

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-neutral-200 p-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-neutral-400">HISTORIAL DE COMPRAS</p>
            <h2 className="mt-1 text-2xl font-bold">{client.nombre} {client.apellido}</h2>
            <p className="mt-1 text-sm text-neutral-500">{client.email}</p>
          </div>
          <button type="button" className="grid size-9 place-items-center rounded-full bg-neutral-100 text-2xl" onClick={onClose}>×</button>
        </header>
        <div className="space-y-6 p-6">
          {balance.isLoading ? <div className="admin-status"><span className="loader" /><p>Cargando balance…</p></div> : null}
          {balance.isError ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800">No se pudo cargar el balance. <button className="font-bold underline" onClick={() => balance.refetch()}>Reintentar</button></div> : null}
          {balance.data ? <>
            {cards("Balance acumulado", balance.data.acumulado)}
            <form className="rounded-xl border border-neutral-200 p-4" onSubmit={aplicarPeriodo}>
              <div className="flex flex-wrap items-end gap-3">
                <label className="text-xs font-bold">Desde<input className="mt-1 block rounded-lg border border-neutral-300 px-3 py-2 text-sm" type="date" value={desde} max={hasta || undefined} onChange={(event) => setDesde(event.target.value)} /></label>
                <label className="text-xs font-bold">Hasta<input className="mt-1 block rounded-lg border border-neutral-300 px-3 py-2 text-sm" type="date" value={hasta} min={desde || undefined} onChange={(event) => setHasta(event.target.value)} /></label>
                <button className="rounded-lg bg-black px-4 py-2 text-xs font-bold text-white">Ver período</button>
                {periodo.desde || periodo.hasta ? <button type="button" className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-bold" onClick={limpiarPeriodo}>Ver todo</button> : null}
              </div>
            </form>
            {cards(periodo.desde || periodo.hasta ? "Compras en el período elegido" : "Compras en todo el historial", resumen)}
            <p className="text-xs leading-5 text-neutral-500">{balance.data.alcance}</p>
          </> : null}
        </div>
      </div>
    </div>
  );
}
