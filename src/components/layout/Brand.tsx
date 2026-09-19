export function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <a className="brand !flex !items-center !gap-0 !no-underline" href="/">
      <img className={`brand-logo block h-12 w-40 object-contain sm:h-14 sm:w-48 ${inverted ? 'invert' : ''}`} src="/brand/logo-pupas.jpg" alt="Pupas"/>
    </a>
  );
}
