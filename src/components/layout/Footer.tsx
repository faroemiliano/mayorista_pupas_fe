import { Brand } from './Brand'
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_LINK, whatsappUrl } from '../../config/contact'

export function Footer() {
  return <footer className="!block !bg-[#faf7f2] !p-0 !text-[#241d17]">
    <section className="grid min-h-72 place-items-center bg-[#faf7f2] px-6 text-center">
      <div><p className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#756351]">¿Tenés un negocio?</p><h2 className="mt-3 font-serif text-4xl">Comprá por mayor</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6b5a4a]">Armá tu pedido online y sumá bikinis y pijamas a tu tienda.</p><a href="/catalogo" className="mt-6 inline-flex bg-[#5b493b] px-6 py-3 text-[9px] font-bold uppercase tracking-[.14em] text-white no-underline transition hover:bg-[#241d17]">Más información</a></div>
    </section>
    <div className="flex justify-center border-y border-[#cdb99f] bg-[#f3eadf] py-8"><Brand/></div>
    <div className="grid md:grid-cols-2">
      <a href="https://www.facebook.com/pupaokk" target="_blank" rel="noopener noreferrer" className="group relative grid min-h-48 overflow-hidden place-items-center text-white no-underline sm:min-h-64" aria-label="Visitar Facebook de Pupas">
        <img className="absolute inset-0 h-full w-full object-cover object-[center_76%] transition duration-700 group-hover:scale-105" src="/images/footer/facebook.webp" alt=""/>
        <span className="absolute inset-0 backdrop-blur-[2px] [mask-image:radial-gradient(ellipse_at_center,transparent_52%,black_100%)]"/>
        <span className="absolute inset-0 bg-black/40 transition group-hover:bg-black/55"/>
        <span className="relative z-10 flex flex-col items-center gap-4">
          <svg className="size-14 fill-current drop-shadow-lg sm:size-16" viewBox="0 0 24 24" aria-hidden="true"><path d="M13.6 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.4v3h2.8v8h3.4Z"/></svg>
          <strong className="text-[9px] uppercase tracking-[.24em]">Seguinos en Facebook</strong>
        </span>
      </a>
      <a href="https://www.instagram.com/pupasokk" target="_blank" rel="noopener noreferrer" className="group relative grid min-h-48 overflow-hidden place-items-center text-white no-underline sm:min-h-64" aria-label="Visitar Instagram de Pupas">
        <img className="absolute inset-0 h-full w-full object-cover object-[center_76%] transition duration-700 group-hover:scale-105" src="/images/footer/instagram.webp" alt=""/>
        <span className="absolute inset-0 backdrop-blur-[2px] [mask-image:radial-gradient(ellipse_at_center,transparent_52%,black_100%)]"/>
        <span className="absolute inset-0 bg-black/40 transition group-hover:bg-black/55"/>
        <span className="relative z-10 flex flex-col items-center gap-4">
          <svg className="size-14 fill-none stroke-current drop-shadow-lg sm:size-16" viewBox="0 0 24 24" strokeWidth="1.4" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.5" cy="6.7" r=".9" fill="currentColor" stroke="none"/></svg>
          <strong className="text-[9px] uppercase tracking-[.24em]">Seguinos en Instagram</strong>
        </span>
      </a>
    </div>
    <div className="!bg-[#cdb99f] px-6 py-10 !text-[#241d17]">
      <div className="mx-auto grid max-w-360 gap-9 text-center md:grid-cols-[1.2fr_1fr_1fr_1fr] md:text-left">
        <div className="flex justify-center md:justify-start"><Brand/></div>
        <div><strong className="text-[9px] uppercase tracking-[.18em]">Ayuda</strong><a href="/como-comprar" className="mt-3 block text-xs text-[#5d4d40] no-underline hover:text-black">Cómo comprar</a><a href="/como-comprar" className="mt-2 block text-xs text-[#5d4d40] no-underline hover:text-black">Preguntas frecuentes</a></div>
        <div><strong className="text-[9px] uppercase tracking-[.18em]">Mi cuenta</strong><a href="/mi-cuenta" className="mt-3 block text-xs text-[#5d4d40] no-underline hover:text-black">Ingresar</a></div>
        <div><strong className="text-[9px] uppercase tracking-[.18em]">Contacto</strong><p className="mt-3 text-xs text-[#5d4d40]">Atención mayorista online</p><a className="mt-2 block text-xs text-[#493b30] no-underline hover:text-black" href={`tel:${CONTACT_PHONE_LINK}`}>{CONTACT_PHONE_DISPLAY}</a><a className="mt-2 block text-xs text-[#5d4d40] no-underline hover:text-black" href={whatsappUrl('Hola, quisiera hacer una consulta mayorista.')} target="_blank" rel="noreferrer">Escribir por WhatsApp</a></div>
      </div>
      <div className="mx-auto mt-9 max-w-360 border-t border-black/15 pt-5 text-center text-[10px] text-[#6b5847]">© 2026. Todos los derechos reservados.</div>
    </div>
  </footer>
}
