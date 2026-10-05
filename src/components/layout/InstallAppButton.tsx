import { useEffect, useState } from "react";

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const savePrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", savePrompt);
    return () => window.removeEventListener("beforeinstallprompt", savePrompt);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowInstructions(true)}
        className="shrink-0 border border-neutral-200 px-3 py-2 text-[9px] font-bold uppercase tracking-[.1em] text-neutral-800 transition hover:border-black hover:bg-neutral-50"
        aria-label="Ver cómo instalar la aplicación de Pupas"
      >
        <span className="mr-1.5 text-xs" aria-hidden="true">
          📱
        </span>
        <span className="sm:hidden">App</span>
        <span className="hidden sm:inline">Instalar app</span>
      </button>
      {showInstructions && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-app-title"
          onMouseDown={() => setShowInstructions(false)}
        >
          <section
            className="w-full max-w-sm bg-white p-6 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="float-right -mt-2 text-2xl text-neutral-500"
              onClick={() => setShowInstructions(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <p className="text-[9px] font-bold uppercase tracking-[.2em] text-neutral-500">
              Pupas en tu celular
            </p>
            <h2
              id="install-app-title"
              className="mt-2 font-serif text-3xl font-semibold"
            >
              Instalá Pupas como app
            </h2>
            <div className="mt-5 space-y-5 text-sm leading-6 text-neutral-700">
              <section className="border border-neutral-200 p-4">
                <h3 className="font-bold text-neutral-900">🍎 Si tenés iPhone</h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5"><li>Abrí esta página usando <strong>Safari</strong>.</li><li>Abajo, tocá <strong>Compartir</strong>: el cuadrado con flecha hacia arriba (□↑).</li><li>Elegí <strong>“Agregar a pantalla de inicio”</strong>.</li><li>Arriba a la derecha, tocá <strong>“Agregar”</strong>.</li></ol>
              </section>
              <section className="border border-neutral-200 p-4">
                <h3 className="font-bold text-neutral-900">🤖 Si tenés Android</h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5"><li>Abrí esta página usando <strong>Google Chrome</strong>.</li><li>Arriba a la derecha, tocá los <strong>tres puntitos</strong> (⋮).</li><li>Elegí <strong>“Instalar app”</strong> o <strong>“Agregar a pantalla principal”</strong>.</li><li>Tocá <strong>“Instalar”</strong> o <strong>“Agregar”</strong>.</li></ol>
              </section>
            </div>
            {!isIos() && deferredPrompt && (
              <button
                type="button"
                className="mt-6 w-full bg-black px-4 py-3 text-xs font-bold uppercase tracking-[.12em] text-white transition hover:bg-neutral-700"
                onClick={() => void install()}
              >
                Instalar app ahora
              </button>
            )}
            <p className="mt-5 border-t border-neutral-200 pt-4 text-xs leading-5 text-neutral-500">
              Después podés tocar el ícono de Pupas para entrar a la tienda
              directamente, igual que con cualquier otra aplicación.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
