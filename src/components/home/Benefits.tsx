export function Benefits() {
  return (
    <section className="benefits !grid !gap-0 !border-y !border-neutral-200 !bg-white !px-5 !py-0 md:!grid-cols-3 md:!px-[7vw]">
      <div className="!flex !justify-center !gap-3 !border-neutral-200 !py-6 md:!border-r">
        △{" "}
        <span>
          <strong>Envíos a todo el país</strong>
          <small>Recibí tu pedido donde estés</small>
        </span>
      </div>
      <div className="!flex !justify-center !gap-3 !border-neutral-200 !py-6 md:!border-r">
        ◇{" "}
        <span>
          <strong>Compra mayorista</strong>
          <small>Precios para hacer crecer tu negocio</small>
        </span>
      </div>
      <div className="!flex !justify-center !gap-3 !py-6">
        ○{" "}
        <span>
          <strong>Atención personalizada</strong>
          <small>Te acompañamos con tu pedido</small>
        </span>
      </div>
    </section>
  );
}
