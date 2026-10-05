import { useState } from 'react'

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)

export function InstallAppButton() {
  const [showInstructions, setShowInstructions] = useState(false)

  return <>
    <button type="button" onClick={() => setShowInstructions(true)} className="shrink-0 border border-neutral-200 px-3 py-2 text-[9px] font-bold uppercase tracking-[.1em] text-neutral-800 transition hover:border-black hover:bg-neutral-50" aria-label="Ver cómo instalar la aplicación de Pupas"><span className="mr-1.5 text-xs" aria-hidden="true">📱</span><span className="hidden sm:inline">Instalar app</span></button>
    {showInstructions && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-5" role="dialog" aria-modal="true" aria-labelledby="install-app-title" onMouseDown={() => setShowInstructions(false)}>
      <section className="w-full max-w-sm bg-white p-6 shadow-2xl" onMouseDown={event => event.stopPropagation()}>
        <button type="button" className="float-right -mt-2 text-2xl text-neutral-500" onClick={() => setShowInstructions(false)} aria-label="Cerrar">×</button>
        <p className="text-[9px] font-bold uppercase tracking-[.2em] text-neutral-500">Pupas en tu celular</p>
        <h2 id="install-app-title" className="mt-2 font-serif text-3xl font-semibold">Instalá Pupas como app</h2>
        {isIos() ? <ol className="mt-5 list-decimal space-y-4 pl-5 text-sm leading-6 text-neutral-700"><li>Abrí esta página usando <strong>Safari</strong>.</li><li>Abajo de la pantalla, tocá el botón <strong>Compartir</strong>: es un cuadrado con una flecha hacia arriba (□↑).</li><li>Buscá y tocá <strong>“Agregar a pantalla de inicio”</strong>.</li><li>Arriba a la derecha, tocá <strong>“Agregar”</strong>. Listo: vas a ver el ícono de Pupas en tu celular.</li></ol> : <ol className="mt-5 list-decimal space-y-4 pl-5 text-sm leading-6 text-neutral-700"><li>Abrí esta página usando <strong>Google Chrome</strong> en tu celular.</li><li>Arriba a la derecha, tocá los <strong>tres puntitos</strong> (⋮).</li><li>Buscá y tocá <strong>“Instalar app”</strong> o <strong>“Agregar a pantalla principal”</strong>.</li><li>Tocá <strong>“Instalar”</strong> o <strong>“Agregar”</strong>. Listo: el ícono de Pupas quedará en tu pantalla.</li></ol>}
        <p className="mt-5 border-t border-neutral-200 pt-4 text-xs leading-5 text-neutral-500">Después podés tocar el ícono de Pupas para entrar a la tienda directamente, igual que con cualquier otra aplicación.</p>
      </section>
    </div>}
  </>
}
