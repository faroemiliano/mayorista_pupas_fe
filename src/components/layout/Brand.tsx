export function Brand({ inverted = false, footer = false }: { inverted?: boolean; footer?: boolean }) {
  return (
    <a className="brand !flex !items-center !gap-0 !no-underline" href="/">
      <img className={`brand-logo block h-12 w-40 object-contain sm:h-14 sm:w-48 md:h-16 md:w-56 ${inverted ? 'invert' : ''} ${footer ? '!h-16 !w-56 mix-blend-multiply opacity-90 sm:!h-20 sm:!w-64' : ''}`} src="/brand/logo-pupas.jpg" alt="Pupas"/>
    </a>
  );
}
