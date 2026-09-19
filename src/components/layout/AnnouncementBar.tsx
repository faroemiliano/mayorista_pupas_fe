import { useEffect, useRef } from "react";

const messages = [
  "Compra mínima: 6 prendas",
  "5% OFF en efectivo",

  "No realizamos cambios",
];

function MessageSequence({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-8 pr-8"
      aria-hidden={hidden || undefined}
    >
      {messages.map((message) => (
        <span
          className="flex shrink-0 items-center gap-8 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[.14em]"
          key={message}
        >
          <span className="text-white/50" aria-hidden="true">
            •
          </span>
          {message}
        </span>
      ))}
    </div>
  );
}

export function AnnouncementBar() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const startAnimation = () =>
      track.animate(
        [
          { transform: "translateX(0)" },
          { transform: `translateX(-${track.scrollWidth / 2}px)` },
        ],
        {
          duration: Math.max(track.scrollWidth * 18, 18000),
          iterations: Infinity,
          easing: "linear",
        },
      );

    let animation = startAnimation();
    const observer = new ResizeObserver(() => {
      animation.cancel();
      animation = startAnimation();
    });
    observer.observe(track);

    return () => {
      observer.disconnect();
      animation.cancel();
    };
  }, []);

  return (
    <aside
      className="sticky top-0 z-50 flex h-8 w-full items-center overflow-hidden bg-neutral-800 text-white"
      aria-label="Condiciones de compra"
    >
      <div
        ref={trackRef}
        className="flex w-max min-w-max items-center will-change-transform"
      >
        <MessageSequence />
        <MessageSequence hidden />
      </div>
    </aside>
  );
}
