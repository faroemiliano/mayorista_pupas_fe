import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AdminLayout } from './components/admin/AdminLayout'
import { Catalog } from './components/catalog/Catalog'
import { CartDrawer } from './components/cart/CartDrawer'
import { Benefits } from './components/home/Benefits'
import { HeroCarousel } from './components/home/HeroCarousel'
import { AnnouncementBar } from './components/layout/AnnouncementBar'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminPlaceholder } from './pages/admin/AdminPlaceholder'
import { AdminProducts } from './pages/admin/AdminProducts'
import { AdminOrders } from './pages/admin/AdminOrders'
import { AdminProductAnalytics } from './pages/admin/AdminProductAnalytics'
import { AdminConfirmations } from './pages/admin/AdminConfirmations'
import { AdminClients } from './pages/admin/AdminClients'
import { MyAccount } from './pages/MyAccount'
import { storeStyles } from './styles/tailwind'

function Storefront() {
  const [search, setSearch] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')

  const clearSearch = () => {
    setSearch('')
    setSubmittedSearch('')
  }

  return <div className={storeStyles}>
    <Header search={search} onSearchChange={setSearch} onSearch={() => setSubmittedSearch(search.trim())}/>
    <AnnouncementBar/>
    <main id="top"><HeroCarousel/><Benefits/><Catalog search={search} submittedSearch={submittedSearch} onClearSearch={clearSearch}/></main>
    <CartDrawer/>
    <Footer/>
  </div>
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return <div className="grid min-h-screen place-items-center"><p>Verificando sesión…</p></div>
  return <Routes>
    <Route path="/mi-cuenta" element={user ? <MyAccount/> : <Navigate to="/" replace/>}/>
    <Route path="/admin" element={user?.rol === 'admin' ? <AdminLayout/> : <Navigate to="/" replace/>}>
      <Route index element={<AdminDashboard/>}/>
      <Route path="productos" element={<AdminProducts/>}/>
      <Route path="analitica" element={<AdminProductAnalytics/>}/>
      <Route path="pedidos" element={<AdminOrders/>}/>
      <Route path="confirmaciones" element={<AdminConfirmations/>}/>
      <Route path="clientes" element={<AdminClients/>}/>
      <Route path="configuracion" element={<AdminPlaceholder title="Configuración" description="Reglas comerciales, sincronización y preferencias de la tienda." icon="⚙"/>}/>
    </Route>
    <Route path="*" element={<Storefront/>}/>
  </Routes>
}
