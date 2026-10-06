const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-D08GHMRXDY'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let initialized = false

function initialize() {
  if (initialized || !measurementId || typeof window === 'undefined') return
  initialized = true
  window.dataLayer = window.dataLayer || []
  window.gtag = (...args: unknown[]) => { window.dataLayer?.push(args) }

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  document.head.appendChild(script)
  window.gtag('js', new Date())
  window.gtag('config', measurementId, { send_page_view: false })
}

export function trackPageView(path: string) {
  initialize()
  window.gtag?.('event', 'page_view', { page_path: path, page_location: window.location.href })
}
