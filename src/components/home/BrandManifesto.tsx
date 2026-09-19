import { Brand } from "../layout/Brand";

export function BrandManifesto() {
  return (
    <section className="grid bg-[#e5e5e3] lg:grid-cols-[42%_58%]">
      <div className="flex min-h-72 items-center justify-center border-b border-black/10 px-8 py-14 lg:min-h-105 lg:border-b-0 lg:border-r">
        <div className="max-w-sm">
          <Brand />
          <p className="mt-7 text-[10px] font-bold uppercase tracking-[.22em] text-neutral-500">
            Selección para revendedoras
          </p>
          <p className="mt-4 text-sm leading-7 text-neutral-600">
            Elegimos prendas versátiles para que puedas construir una propuesta
            propia, rentable y distinta.
          </p>
        </div>
      </div>
      <div className="flex min-h-80 items-center bg-black px-8 py-16 text-white sm:px-14 lg:min-h-105 lg:px-[8vw]">
        <div className="max-w-3xl">
          <span className="text-[9px] font-bold uppercase tracking-[.3em] text-white/50">
            El espíritu de la marca
          </span>
          <h2 className="mt-6 font-serif text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            No llenamos percheros.
            <br />
            <em className="font-normal text-neutral-400">
              Creamos próximas vidrieras.
            </em>
          </h2>
          <div className="mt-8 h-px w-24 bg-white/40" />
          <p className="mt-6 max-w-xl text-sm leading-7 text-white/65">
            Bikinis y pijamas pensados para negocios que quieren vender con
            identidad.
          </p>
        </div>
      </div>
    </section>
  );
}
