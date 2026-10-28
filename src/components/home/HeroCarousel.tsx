import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { heroSlides } from "../../data/heroSlides";
import { getPortadasInicio, updatePortadaInicio } from "../../api/portada";
import { useAuth } from "../../context/AuthContext";

const ROTATION_TIME = 6500;

function EmptyMedia({ kind }: { kind: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[#e9e7e3] text-center text-neutral-500">
      <div className="max-w-xs px-6">
        <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full border border-neutral-400 text-xl">
          ＋
        </span>
        <strong className="block font-serif text-xl font-medium text-neutral-700">
          Espacio para {kind}
        </strong>
        <small className="mt-2 block text-[10px] uppercase tracking-[.18em]">
          La portada ya está preparada
        </small>
      </div>
    </div>
  );
}

export function HeroCarousel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const portadas = useQuery({ queryKey: ["portadas-inicio"], queryFn: getPortadasInicio });
  const actualizarPortada = useMutation({
    mutationFn: ({ slideId, file }: { slideId: string; file: File }) => new Promise<{ slideId: string; nombre: string; mediaType: string; contenido: string }>((resolve, reject) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        reject(new Error('Elegí una imagen JPG, PNG o WEBP.'));
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        reject(new Error('La imagen puede pesar hasta 8 MB.'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
      reader.onload = () => resolve({
        slideId,
        nombre: file.name,
        mediaType: file.type,
        contenido: String(reader.result).split(',')[1] || '',
      });
      reader.readAsDataURL(file);
    }).then(({ slideId, nombre, mediaType, contenido }) => updatePortadaInicio(slideId, {
      nombre,
      media_type: mediaType,
      contenido_base64: contenido,
    })),
    onSuccess: () => {
      setFailed({});
      queryClient.invalidateQueries({ queryKey: ["portadas-inicio"] });
    },
    onSettled: () => setEditingSlideId(null),
  });
  const puedeEditarPortada = user?.rol === 'admin' || user?.rol === 'admin_tecnico';
  const slides = heroSlides.map((slide) => ({
    ...slide,
    // Esperamos la configuración antes de iniciar un fallback local. Evita
    // pedir primero Vercel y luego R2 para el mismo espacio de portada.
    mediaUrl: portadas.isPending ? undefined : portadas.data?.imagenes[slide.id],
  }));

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      ROTATION_TIME,
    );
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const move = (direction: number) =>
    setActive(
      (current) =>
        (current + direction + slides.length) % slides.length,
    );
  const markFailed = (id: string) =>
    setFailed((current) => ({ ...current, [id]: true }));

  return (
    <section
      className="relative h-[68svh] min-h-120 overflow-hidden bg-neutral-200 md:h-[72vh] md:min-h-145"
      aria-roledescription="carrusel"
      aria-label="Colecciones destacadas"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <article
            className="relative h-full min-w-full overflow-hidden"
            key={slide.id}
            aria-hidden={index !== active}
          >
            {!failed[slide.id] &&
              slide.mediaType === "video" &&
              slide.mediaUrl && (
                <video
                  className="h-full w-full object-cover"
                  src={slide.mediaUrl}
                  poster={slide.posterUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  onError={() => markFailed(slide.id)}
                />
              )}
            {!failed[slide.id] &&
              slide.mediaType === "image" &&
              slide.mediaUrl && (
                <img
                  className={`h-full w-full object-cover ${slide.id === "pijamas" ? "object-[center_42%]" : ""}`}
                  src={slide.mediaUrl}
                  alt=""
                  onError={() => markFailed(slide.id)}
                />
              )}
            {(failed[slide.id] || slide.mediaType === "placeholder" || !slide.mediaUrl) && (
              <EmptyMedia
                kind={slide.mediaType === "video" ? "video" : "foto"}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />
            {puedeEditarPortada && index === active && (
              <button
                type="button"
                className="absolute left-5 top-5 z-30 inline-flex items-center gap-2 rounded-full border border-white/70 bg-black/55 px-4 py-2 text-[10px] font-bold uppercase tracking-[.14em] text-white backdrop-blur transition hover:bg-black disabled:cursor-wait disabled:opacity-70 sm:left-7 sm:top-7"
                disabled={actualizarPortada.isPending}
                onClick={() => {
                  setEditingSlideId(slide.id);
                  fileInput.current?.click();
                }}
              >
                <span className="text-lg leading-none">＋</span>
                {actualizarPortada.isPending && editingSlideId === slide.id ? 'Guardando…' : 'Cambiar foto'}
              </button>
            )}
            <div className="absolute inset-x-0 bottom-14 z-10 mx-auto max-w-360 px-7 text-white sm:px-12 lg:bottom-18 lg:px-[7vw]">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.24em]">
                {slide.eyebrow}
              </p>
              <h1 className="max-w-3xl font-serif text-4xl leading-[.95] sm:text-6xl lg:text-7xl">
                {slide.title}
                <br />
                <em className="font-normal">{slide.highlightedTitle}</em>
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-6 text-white/85 sm:text-base">
                {slide.description}
              </p>
              <a
                className="mt-6 inline-flex border border-white bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[.18em] text-neutral-900 no-underline transition hover:bg-transparent hover:text-white"
                href="#colecciones"
              >
                Descubrí más
              </a>
            </div>
          </article>
        ))}
      </div>
      <button
        className="absolute left-4 top-1/2 z-20 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-neutral-800/55 text-xl text-white"
        type="button"
        onClick={() => move(-1)}
        aria-label="Colección anterior"
      >
        ‹
      </button>
      <button
        className="absolute right-4 top-1/2 z-20 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-neutral-800/55 text-xl text-white"
        type="button"
        onClick={() => move(1)}
        aria-label="Colección siguiente"
      >
        ›
      </button>
      <div className="pointer-events-none absolute right-5 top-5 z-20 rotate-[10deg] sm:right-7 sm:top-7">
        <div className="relative grid size-34 place-items-center rounded-full border border-white/50 bg-[#f5f0e9]/80 shadow-[6px_8px_0_rgba(23,18,13,.18),12px_16px_26px_rgba(0,0,0,.22)] backdrop-blur-[2px] sm:size-42">
          <span className="absolute inset-2 rounded-full border border-[#806b58]/35" />
          <div className="relative -rotate-[4deg] text-center text-[#604e3d]/85">
            <span className="block text-[6px] font-bold tracking-[.3em] sm:text-[7px]">PUPAS</span>
            <div className="mt-1 flex items-center justify-center gap-1"><span className="text-[7px] text-[#b28a5a] sm:text-[8px]" aria-hidden="true">✦</span><strong className="font-serif text-base leading-[.95] tracking-[.07em] sm:text-xl">DIRECTO</strong><span className="text-[7px] text-[#b28a5a] sm:text-[8px]" aria-hidden="true">✦</span></div>
            <span className="mt-0.5 block text-[7px] font-bold tracking-[.16em] sm:text-[9px]">DE FÁBRICA</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`h-0.5 transition-all ${index === active ? "w-8 bg-white" : "w-4 bg-white/50"}`}
            onClick={() => setActive(index)}
            aria-label={`Ver colección ${slide.id}`}
            aria-current={index === active ? "true" : undefined}
          />
        ))}
      </div>
      {puedeEditarPortada && <input
        ref={fileInput}
        className="hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          const slideId = editingSlideId;
          event.currentTarget.value = '';
          if (file && slideId) actualizarPortada.mutate({ slideId, file });
        }}
      />}
      {actualizarPortada.isError && <p className="absolute bottom-14 left-1/2 z-30 max-w-[90vw] -translate-x-1/2 rounded-lg bg-red-700/95 px-4 py-2 text-center text-xs font-semibold text-white">{actualizarPortada.error.message}</p>}
    </section>
  );
}
