import { useEffect, useState } from "react";
import { heroSlides } from "../../data/heroSlides";

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
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % heroSlides.length),
      ROTATION_TIME,
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  const move = (direction: number) =>
    setActive(
      (current) =>
        (current + direction + heroSlides.length) % heroSlides.length,
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
        {heroSlides.map((slide, index) => (
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
            {(failed[slide.id] || slide.mediaType === "placeholder") && (
              <EmptyMedia
                kind={slide.mediaType === "video" ? "video" : "foto"}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />
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
      <div className="absolute right-7 top-7 z-20 hidden items-center gap-3 text-white/80 lg:flex">
        <span className="h-px w-10 bg-white/50" />
        <span className="text-[8px] font-bold uppercase tracking-[.28em] [writing-mode:vertical-rl]">
          Indumentaria mayorista
        </span>
      </div>
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.id}
            className={`h-0.5 transition-all ${index === active ? "w-8 bg-white" : "w-4 bg-white/50"}`}
            onClick={() => setActive(index)}
            aria-label={`Ver colección ${slide.id}`}
            aria-current={index === active ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
