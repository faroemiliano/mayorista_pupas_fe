import { InstallAppButton } from '../layout/InstallAppButton'

export function InstallPupasApp() {
  return <section className="bg-[#171717] px-5 py-16 text-white sm:px-8 lg:px-[7vw] lg:py-22">
    <div className="mx-auto grid max-w-360 gap-10 lg:grid-cols-[1fr_1.25fr] lg:items-center lg:gap-18">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[.26em] text-neutral-400">Pupas siempre a mano</p>
        <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">Guardá Pupas como una app en tu celular.</h2>
        <p className="mt-5 max-w-lg text-sm leading-7 text-neutral-300">No necesitás descargar nada de una tienda de aplicaciones. Creá el ícono de Pupas en tu pantalla de inicio y abrí la tienda con un toque.</p>
        <div className="mt-7 [&>button]:!border-white [&>button]:!bg-white [&>button]:!text-black"><InstallAppButton /></div>
      </div>
      <div className="grid gap-px overflow-hidden border border-white/20 bg-white/20 sm:grid-cols-3">
        <article className="bg-[#171717] p-5 sm:p-6"><span className="grid size-9 place-items-center rounded-full border border-white/40 text-sm">1</span><h3 className="mt-5 text-sm font-bold uppercase tracking-wide">Tocá instalar</h3><p className="mt-2 text-sm leading-6 text-neutral-400">Elegí “Instalar Pupas en tu celular”.</p></article>
        <article className="bg-[#171717] p-5 sm:p-6"><span className="grid size-9 place-items-center rounded-full border border-white/40 text-sm">2</span><h3 className="mt-5 text-sm font-bold uppercase tracking-wide">Confirmá</h3><p className="mt-2 text-sm leading-6 text-neutral-400">En Android confirmás la instalación. En iPhone te guiamos desde Safari.</p></article>
        <article className="bg-[#171717] p-5 sm:p-6"><span className="grid size-9 place-items-center rounded-full border border-white/40 text-sm">3</span><h3 className="mt-5 text-sm font-bold uppercase tracking-wide">Abrí Pupas</h3><p className="mt-2 text-sm leading-6 text-neutral-400">El ícono queda en tu inicio para entrar a la tienda cuando quieras.</p></article>
      </div>
    </div>
  </section>
}
