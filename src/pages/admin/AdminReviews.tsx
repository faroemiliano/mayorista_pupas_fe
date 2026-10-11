import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminReviews, moderateReview } from '../../api/reviews'
import type { CustomerReview, ReviewStatus } from '../../types/review'

const labels: Record<ReviewStatus, string> = { pendiente: 'Pendiente', aprobada: 'Publicada', rechazada: 'Rechazada' }
const tone: Record<ReviewStatus, string> = { pendiente: 'bg-amber-50 text-amber-800 border-amber-200', aprobada: 'bg-emerald-50 text-emerald-800 border-emerald-200', rechazada: 'bg-red-50 text-red-700 border-red-200' }

function Stars({ value }: { value: number }) { return <span className="text-amber-600" aria-label={`${value} estrellas`}>{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span> }

export function AdminReviews() {
  const [filter, setFilter] = useState<ReviewStatus | 'todas'>('pendiente')
  const queryClient = useQueryClient()
  const reviews = useQuery({ queryKey: ['admin-reviews', filter], queryFn: () => getAdminReviews(filter === 'todas' ? undefined : filter) })
  const moderate = useMutation({ mutationFn: ({ id, data }: { id: number; data: { estado?: ReviewStatus; destacada?: boolean } }) => moderateReview(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }) })
  const act = (review: CustomerReview, data: { estado?: ReviewStatus; destacada?: boolean }) => moderate.mutate({ id: review.id, data })

  return <div className="admin-page">
    <header className="admin-page-header"><div><p className="eyebrow">CONFIANZA EN LA TIENDA</p><h1>Opiniones de clientes</h1><span>Revisá cada comentario antes de mostrarlo públicamente en Inicio.</span></div></header>
    <div className="mb-5 flex flex-wrap gap-2">{(['pendiente', 'aprobada', 'rechazada', 'todas'] as const).map((item) => <button className={`rounded-full border px-4 py-2 text-xs font-bold ${filter === item ? 'border-black bg-black text-white' : 'border-neutral-300 bg-white text-neutral-700'}`} key={item} onClick={() => setFilter(item)}>{item === 'todas' ? 'Todas' : labels[item]}</button>)}</div>
    {reviews.isLoading ? <p className="p-8 text-sm text-neutral-500">Cargando opiniones…</p> : reviews.isError ? <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">{reviews.error.message}</p> : !reviews.data?.length ? <div className="border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">No hay opiniones en este estado.</div> : <div className="grid gap-4">{reviews.data.map((review) => <article className="border border-neutral-200 bg-white p-5" key={review.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-3"><strong>{review.cliente_nombre}</strong><Stars value={review.calificacion}/></div><small className="mt-1 block text-neutral-500">{review.cliente_email} · {new Date(review.creada_en).toLocaleDateString('es-AR')}</small></div><span className={`border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${tone[review.estado]}`}>{labels[review.estado]}</span></div><p className="mt-4 max-w-3xl text-sm leading-6 text-neutral-700">{review.comentario}</p><div className="mt-5 flex flex-wrap gap-2 border-t border-neutral-100 pt-4">{review.estado !== 'aprobada' && <button className="border border-emerald-600 px-3 py-2 text-xs font-bold text-emerald-700" onClick={() => act(review, { estado: 'aprobada' })}>Publicar</button>}{review.estado !== 'rechazada' && <button className="border border-red-200 px-3 py-2 text-xs font-bold text-red-700" onClick={() => act(review, { estado: 'rechazada' })}>Rechazar</button>}{review.estado === 'aprobada' && <button className={`border px-3 py-2 text-xs font-bold ${review.destacada ? 'border-black bg-black text-white' : 'border-neutral-300 text-neutral-700'}`} onClick={() => act(review, { destacada: !review.destacada })}>{review.destacada ? '★ Destacada' : '☆ Destacar'}</button>}</div></article>)}</div>}
  </div>
}
