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
      <img className="h-auto w-44 object-contain" src="/brand/logo-pupas.jpg" alt="Pupas"/>
      <div className="mt-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.22em] text-neutral-500">
        <span className="size-4 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900"/>
        Cargando
      </div>
    </div>
  </div>
}
