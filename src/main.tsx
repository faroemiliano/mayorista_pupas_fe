import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'
import { CartProvider } from './context/CartContext.tsx'
import './index.css'
import App from './App.tsx'
import { ShoppingToolsProvider } from './context/ShoppingToolsContext.tsx'

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } })

// La tienda no usa contenido offline. Desregistramos el service worker vacío
// anterior para evitar que el navegador siga comprobando /sw.js en Vercel.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.getRegistrations().then((registrations) =>
      Promise.all(registrations.map((registration) => registration.unregister())),
    )
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><QueryClientProvider client={queryClient}><AuthProvider><CartProvider><ShoppingToolsProvider><App /></ShoppingToolsProvider></CartProvider></AuthProvider></QueryClientProvider></BrowserRouter></StrictMode>,
)
