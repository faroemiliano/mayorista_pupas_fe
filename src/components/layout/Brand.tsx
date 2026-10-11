export function Brand({ inverted = false, footer = false, compact = false }: { inverted?: boolean; footer?: boolean; compact?: boolean }) {
  const size = compact ? 'h-11 w-36 sm:h-12 sm:w-40 md:h-12 md:w-44' : 'h-12 w-40 sm:h-14 sm:w-48 md:h-16 md:w-56'
  return (
    <a className="brand !flex !items-center !gap-0 !no-underline" href="/">
      <img className={`brand-logo block ${size} object-contain ${inverted ? 'invert' : ''} ${footer ? '!h-16 !w-56 mix-blend-multiply opacity-90 sm:!h-20 sm:!w-64' : ''}`} src="/brand/logo-pupas.jpg" alt="Pupas"/>
    </a>
  );
}
