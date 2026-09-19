import { Link } from 'react-router-dom'

const steps = [
  {
    number: '01',
    title: 'Creá tu cuenta mayorista',
    text: 'Registrate con tus datos comerciales, domicilio y canal de venta. El equipo revisará la solicitud antes de habilitar las compras.',
    note: 'Si ya tenés una cuenta, simplemente iniciá sesión desde el encabezado.',
  },
  {
    number: '02',
    title: 'Esperá la aprobación',
    text: 'Cuando tu cuenta sea aprobada recibirás la confirmación y podrás ingresar para consultar precios, talles y stock disponible.',
    note: 'Mientras tanto podés recorrer el catálogo en modo informativo.',
  },
  {
    number: '03',
    title: 'Elegí productos y talles',
    text: 'Recorré Bikinis, Pijamas o el catálogo completo. Seleccioná el talle, indicá la cantidad y agregá cada producto al carrito.',
    note: 'Podés combinar modelos y talles diferentes en un mismo pedido.',
  },
  {
    number: '04',
    title: 'Completá el mínimo mayorista',
    text: 'La compra se habilita al reunir al menos 6 prendas en total, sin importar si son productos o talles diferentes.',
    note: 'El carrito te indica cuántas unidades faltan para alcanzar el mínimo.',
  },
  {
    number: '05',
    title: 'Revisá precios y confirmá',
    text: 'Antes de confirmar vas a ver las unidades, el total sin descuento, el descuento aplicado y el importe final del pedido.',
    note: 'Los datos de entrega se toman de tu cuenta para que no tengas que cargarlos nuevamente.',
  },
  {
    number: '06',
    title: 'Coordinamos tu compra',
    text: 'El pedido llegará al equipo de Pupas. Desde allí se confirmarán disponibilidad, pago, preparación y forma de entrega.',
    note: 'Podrás seguir el pedido y sus novedades desde Mi cuenta.',
  },
] as const

export function HowToBuy() {
  return <div className="bg-white">
    <section className="border-b border-neutral-200 bg-neutral-100 px-5 py-16 text-center sm:px-8 sm:py-24">
      <p className="text-[10px] font-extrabold uppercase tracking-[.28em] text-neutral-500">Guía de compra mayorista</p>
      <h1 className="mx-auto mt-4 max-w-3xl font-serif text-5xl font-semibold leading-none sm:text-7xl">Comprar en Pupas es simple</h1>
      <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-neutral-600">Desde la creación de tu cuenta hasta la confirmación del pedido, te acompañamos en cada paso.</p>
      <Link to="/catalogo" className="mt-8 inline-flex bg-black px-7 py-4 text-[10px] font-extrabold uppercase tracking-[.18em] text-white no-underline">Ver catálogo</Link>
    </section>

    <section className="mx-auto max-w-300 px-5 py-16 sm:px-8 sm:py-24">
      <div className="grid gap-px overflow-hidden border border-neutral-200 bg-neutral-200 md:grid-cols-2">
        {steps.map(step => <article key={step.number} className="group bg-white p-7 sm:p-10">
          <div className="flex items-start gap-5">
            <span className="font-serif text-4xl italic text-neutral-300 transition group-hover:text-black">{step.number}</span>
            <div><h2 className="font-serif text-2xl font-semibold sm:text-3xl">{step.title}</h2><p className="mt-4 text-sm leading-7 text-neutral-600">{step.text}</p><p className="mt-5 border-l-2 border-black pl-4 text-xs leading-5 text-neutral-500">{step.note}</p></div>
          </div>
        </article>)}
      </div>
    </section>

    <section className="bg-black px-6 py-16 text-center text-white sm:py-20">
      <p className="text-[9px] font-bold uppercase tracking-[.25em] text-white/50">¿Todavía tenés dudas?</p>
      <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Estamos para ayudarte</h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/60">Podés escribirnos desde el botón de WhatsApp disponible en la página y te ayudamos a preparar tu pedido.</p>
      <Link to="/catalogo" className="mt-7 inline-flex border border-white px-7 py-3 text-[10px] font-bold uppercase tracking-[.18em] text-white no-underline transition hover:bg-white hover:text-black">Empezar a comprar</Link>
    </section>
  </div>
}
