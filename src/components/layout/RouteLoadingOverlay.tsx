import { useEffect, useRef, useState } from 'react'
import { useIsFetching } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'

const MINIMUM_VISIBLE_MS = 450
const MAXIMUM_VISIBLE_MS = 8_000

export function RouteLoadingOverlay() {
  const location = useLocation()
  const isFetching = useIsFetching()
  const fetchingRef = useRef(isFetching)
  const [visible, setVisible] = useState(true)

  useEffect(() => { fetchingRef.current = isFetching }, [isFetching])

  useEffect(() => {
    const startedAt = Date.now()
    setVisible(true)

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      const images = Array.from(document.querySelectorAll<HTMLImageElement>('main img'))
      const hayImagenesPendientes = images.some(image => !image.complete)
      const terminado = fetchingRef.current === 0 && !hayImagenesPendientes

      if ((elapsed >= MINIMUM_VISIBLE_MS && terminado) || elapsed >= MAXIMUM_VISIBLE_MS) {
        window.clearInterval(timer)
        setVisible(false)
      }
    }, 80)

    return () => window.clearInterval(timer)
  }, [location.pathname, location.search])

  return <div className={`fixed inset-0 z-[200] grid place-items-center bg-[#f7f7f5] transition-opacity duration-300 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={!visible}>
    <div className="flex flex-col items-center px-8 text-center">
      <div className="relative grid size-36 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full border border-neutral-300/80 [animation-duration:2.4s]"/>
        <span className="absolute inset-1 rounded-full border border-neutral-300 border-t-neutral-900/70 animate-[spin_4s_linear_infinite]"/>
        <span className="absolute inset-4 rounded-full bg-neutral-200/80 blur-md"/>
        <div className="relative size-28 overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_12px_34px_rgba(0,0,0,.16)] animate-[pulse_2.2s_ease-in-out_infinite]">
          <img className="size-full scale-110 object-cover" src="/brand/logo-pupas-original.jpg" alt="Pupas"/>
        </div>
      </div>
      <div className="mt-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.22em] text-neutral-500">
        <span className="size-4 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900"/>
        Cargando
      </div>
    </div>
  </div>
}
