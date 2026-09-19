import { whatsappUrl } from '../../config/contact'

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl('Hola, estoy visitando la tienda mayorista y quisiera hacer una consulta.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      className="group fixed bottom-5 right-4 z-[90] flex items-center gap-2.5 rounded-full bg-[#25D366] p-3.5 text-white no-underline shadow-[0_8px_28px_rgba(37,211,102,.42)] transition duration-300 hover:-translate-y-1 hover:bg-[#20bd5a] hover:shadow-[0_12px_34px_rgba(37,211,102,.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366] sm:bottom-7 sm:right-7 sm:px-5 sm:py-3"
    >
      <svg className="size-7 shrink-0" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M16.03 3.2A12.72 12.72 0 0 0 5.1 22.4L3.3 29l6.75-1.77A12.73 12.73 0 1 0 16.03 3.2Zm0 23.3a10.56 10.56 0 0 1-5.38-1.47l-.38-.23-4 .99 1.07-3.9-.25-.4A10.56 10.56 0 1 1 16.03 26.5Zm5.8-7.91c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.72.16-.2.31-.81 1.03-1 1.24-.18.21-.37.24-.68.08-.32-.16-1.34-.49-2.55-1.57a9.53 9.53 0 0 1-1.76-2.18c-.18-.32-.02-.49.14-.65.14-.14.32-.37.47-.55.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.25-.62-.52-.54-.71-.55h-.61c-.21 0-.55.08-.84.4-.29.31-1.1 1.08-1.1 2.64 0 1.55 1.13 3.06 1.29 3.27.16.21 2.23 3.4 5.4 4.77.75.32 1.34.52 1.8.67.76.24 1.45.21 2 .13.6-.09 1.88-.77 2.14-1.51.27-.74.27-1.38.19-1.51-.08-.14-.29-.21-.61-.37Z" />
      </svg>
      <span className="hidden text-sm font-extrabold sm:block">
        ¿Necesitás ayuda?
        <small className="block text-[10px] font-semibold uppercase tracking-wider text-white/85">Escribinos por WhatsApp</small>
      </span>
      <span className="pointer-events-none absolute -left-2 top-1/2 size-3 -translate-x-full -translate-y-1/2 rounded-full bg-[#25D366] opacity-0 group-hover:animate-ping sm:hidden" />
    </a>
  )
}
