import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPublicReviews } from '../../api/reviews'

const REVIEWS_PER_PAGE = 3

function Stars({ value }: { value: number }) {
  return <span className="tracking-[.12em] text-amber-600" aria-label={`${value} de 5 estrellas`}>{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>
}

export function CustomerTestimonials() {
  const reviews = useQuery({ queryKey: ['public-reviews'], queryFn: getPublicReviews, staleTime: 10 * 60_000 })
  const [page, setPage] = useState(0)
  const allReviews = reviews.data ?? []
  const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE)
  const visibleReviews = allReviews.slice(page * REVIEWS_PER_PAGE, (page + 1) * REVIEWS_PER_PAGE)

  useEffect(() => {
    if (page >= totalPages) setPage(Math.max(totalPages - 1, 0))
  }, [page, totalPages])

  if (!allReviews.length) return null

  return <section className="border-y border-neutral-200 bg-[#fbfaf8] px-5 py-10 sm:px-8 md:px-[7vw] md:py-14">
    <div className="mx-auto max-w-360">
      <div className="max-w-xl"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-neutral-500">Experiencias reales</p><h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Lo que dicen nuestras clientas</h2><p className="mt-2 text-sm leading-6 text-neutral-600">Opiniones enviadas por clientes registradas y revisadas por nuestro equipo.</p></div>
      <div className="mt-7 grid gap-3 lg:grid-cols-3">{visibleReviews.map((review) => <article className="flex min-h-40 flex-col border border-neutral-200 bg-white p-4 sm:p-5" key={review.id}><Stars value={review.calificacion}/><p className="mt-3 grow font-serif text-base leading-6 text-neutral-800 sm:text-lg">“{review.comentario}”</p><div className="mt-4 border-t border-neutral-100 pt-3"><strong className="text-sm">{review.cliente_nombre}</strong><span className="mt-1 block text-[8px] font-bold uppercase tracking-[.14em] text-neutral-400">Cliente Pupas</span></div></article>)}</div>
      {totalPages > 1 && <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Paginación de opiniones"><button type="button" className="grid size-9 place-items-center border border-neutral-300 bg-white text-lg transition hover:border-black disabled:cursor-not-allowed disabled:opacity-35" onClick={() => setPage((current) => Math.max(current - 1, 0))} disabled={page === 0} aria-label="Opiniones anteriores">‹</button><span className="min-w-14 text-center text-[10px] font-bold uppercase tracking-[.14em] text-neutral-500">{page + 1} / {totalPages}</span><button type="button" className="grid size-9 place-items-center border border-neutral-300 bg-white text-lg transition hover:border-black disabled:cursor-not-allowed disabled:opacity-35" onClick={() => setPage((current) => Math.min(current + 1, totalPages - 1))} disabled={page === totalPages - 1} aria-label="Más opiniones">›</button></nav>}
    </div>
  </section>
}
