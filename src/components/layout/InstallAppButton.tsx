import { useEffect, useState } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null)
  const [showIosHelp, setShowIosHelp] = useState(false)
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

  const install = async () => {
    if (isIos()) { setShowIosHelp(true); return }
    if (!deferredPrompt) {
      window.alert('Para instalar Pupas, abrí esta página desde Chrome en tu celular y elegí “Agregar a pantalla de inicio” en el menú del navegador.')
      return
    }
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') setDeferredPrompt(null)
  }

  return <>
    <button type="button" onClick={install} className="shrink-0 border border-neutral-300 px-3 py-2 text-[9px] font-bold uppercase tracking-[.12em] text-neutral-800 transition hover:border-black hover:bg-neutral-50" aria-label="Agregar Pupas a la pantalla de inicio">▣ <span className="hidden sm:inline">Instalar Pupas</span><span className="sm:hidden">App</span></button>
    {showIosHelp && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-5" role="dialog" aria-modal="true" aria-labelledby="install-ios-title" onMouseDown={() => setShowIosHelp(false)}>
      <section className="w-full max-w-sm bg-white p-6 shadow-2xl" onMouseDown={event => event.stopPropagation()}>
        <button type="button" className="float-right -mt-2 text-2xl text-neutral-500" onClick={() => setShowIosHelp(false)} aria-label="Cerrar">×</button>
        <p className="text-[9px] font-bold uppercase tracking-[.2em] text-neutral-500">Pupas en tu celular</p>
        <h2 id="install-ios-title" className="mt-2 font-serif text-3xl font-semibold">Agregar como app</h2>
        <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-6 text-neutral-700"><li>Tocá el botón <strong>Compartir</strong> de Safari (□↑).</li><li>Elegí <strong>“Agregar a pantalla de inicio”</strong>.</li><li>Confirmá con <strong>“Agregar”</strong>.</li></ol>
        <p className="mt-5 border-t border-neutral-200 pt-4 text-xs text-neutral-500">Verás el ícono de Pupas en tu celular y podrás abrir la tienda como una aplicación.</p>
      </section>
    </div>}
  </>
}
