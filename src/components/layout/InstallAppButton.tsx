import { useEffect, useState } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    setInstalled(isStandalone())
    const savePrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as InstallPromptEvent)
    }
    const installedApp = () => { setInstalled(true); setDeferredPrompt(null) }
    window.addEventListener('beforeinstallprompt', savePrompt)
    window.addEventListener('appinstalled', installedApp)
    return () => { window.removeEventListener('beforeinstallprompt', savePrompt); window.removeEventListener('appinstalled', installedApp) }
  }, [])

  if (installed) return null

  const startInstall = async () => {
    if (isIos()) return
    if (!deferredPrompt) {
      window.alert('Para instalar Pupas, abrí esta página desde Chrome en tu celular y elegí “Agregar a pantalla de inicio” en el menú del navegador.')
      return
    }
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') setDeferredPrompt(null)
  }

  return <>
    <button type="button" onClick={() => setShowInstructions(true)} className="shrink-0 bg-transparent text-[9px] font-bold uppercase tracking-[.1em] text-neutral-900 transition hover:opacity-55" aria-label="Instalar la aplicación de Pupas">Instalar app</button>
    {showInstructions && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-5" role="dialog" aria-modal="true" aria-labelledby="install-app-title" onMouseDown={() => setShowInstructions(false)}>
      <section className="w-full max-w-sm bg-white p-6 shadow-2xl" onMouseDown={event => event.stopPropagation()}>
        <button type="button" className="float-right -mt-2 text-2xl text-neutral-500" onClick={() => setShowInstructions(false)} aria-label="Cerrar">×</button>
        <p className="text-[9px] font-bold uppercase tracking-[.2em] text-neutral-500">Pupas en tu celular</p>
        <h2 id="install-app-title" className="mt-2 font-serif text-3xl font-semibold">Instalá Pupas como app</h2>
        {isIos() ? <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-6 text-neutral-700"><li>Tocá el botón <strong>Compartir</strong> de Safari (□↑).</li><li>Elegí <strong>“Agregar a pantalla de inicio”</strong>.</li><li>Confirmá con <strong>“Agregar”</strong>.</li></ol> : <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-6 text-neutral-700"><li>Tocá <strong>“Instalar ahora”</strong>.</li><li>Confirmá la instalación que mostrará tu navegador.</li><li>Vas a ver el ícono de Pupas en tu pantalla de inicio.</li></ol>}
        {!isIos() && <button type="button" className="mt-6 w-full bg-black px-4 py-3 text-xs font-bold uppercase tracking-[.12em] text-white transition hover:bg-neutral-700" onClick={() => void startInstall()}>Instalar ahora</button>}
        <p className="mt-5 border-t border-neutral-200 pt-4 text-xs text-neutral-500">Después vas a poder abrir Pupas directamente desde su ícono, como una aplicación.</p>
      </section>
    </div>}
  </>
}
