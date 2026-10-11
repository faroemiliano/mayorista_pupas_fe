import { useQuery } from '@tanstack/react-query'
import { getPublicReviews } from '../../api/reviews'

function Stars({ value }: { value: number }) {
  return <span className="tracking-[.12em] text-amber-600" aria-label={`${value} de 5 estrellas`}>{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>
}

export function CustomerTestimonials() {
  const reviews = useQuery({ queryKey: ['public-reviews'], queryFn: getPublicReviews, staleTime: 10 * 60_000 })
  if (!reviews.data?.length) return null

  return <section className="border-y border-neutral-200 bg-[#fbfaf8] px-5 py-14 sm:px-8 md:px-[7vw] md:py-20">
    <div className="mx-auto max-w-360">
      <div className="max-w-xl"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-neutral-500">Experiencias reales</p><h2 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">Lo que dicen nuestras clientas</h2><p className="mt-3 text-sm leading-6 text-neutral-600">Opiniones enviadas por clientes registradas y revisadas por nuestro equipo.</p></div>
      <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{reviews.data.map((review) => <article className="flex min-h-52 flex-col border border-neutral-200 bg-white p-6" key={review.id}><Stars value={review.calificacion}/><p className="mt-5 grow font-serif text-xl leading-8 text-neutral-800">“{review.comentario}”</p><div className="mt-6 border-t border-neutral-100 pt-4"><strong className="text-sm">{review.cliente_nombre}</strong><span className="mt-1 block text-[9px] font-bold uppercase tracking-[.14em] text-neutral-400">Cliente Pupas</span></div></article>)}</div>
    </div>
  </section>
}
