import { useCallback, useEffect, useRef, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AdminLayout } from "./components/admin/AdminLayout";
import { Catalog } from "./components/catalog/Catalog";
import { CartDrawer } from "./components/cart/CartDrawer";
import { Benefits } from "./components/home/Benefits";
import { HeroCarousel } from "./components/home/HeroCarousel";
import { EditorialCollections } from "./components/home/EditorialCollections";
import { FeaturedProducts } from "./components/home/FeaturedProducts";
import { BrandManifesto } from "./components/home/BrandManifesto";
import { AnnouncementBar } from "./components/layout/AnnouncementBar";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { WhatsAppFloat } from "./components/layout/WhatsAppFloat";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminPlaceholder } from "./pages/admin/AdminPlaceholder";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminProductAnalytics } from "./pages/admin/AdminProductAnalytics";
import { AdminTrafficAnalytics } from "./pages/admin/AdminTrafficAnalytics";
import { AdminConfirmations } from "./pages/admin/AdminConfirmations";
import { AdminClients } from "./pages/admin/AdminClients";
import { MyAccount } from "./pages/MyAccount";
import { ProductDetail } from "./pages/ProductDetail";
import { AdminNotifications } from "./pages/admin/AdminNotifications";
import { AdminSizeStock } from "./pages/admin/AdminSizeStock";
import { HowToBuy } from "./pages/HowToBuy";
import { AdminMaterials } from "./pages/admin/AdminMaterials";
import { storeStyles } from "./styles/tailwind";
import { ResetPassword } from "./pages/ResetPassword";
import { AdminWordpressMigration } from "./pages/admin/AdminWordpressMigration";
import { RouteLoadingOverlay } from "./components/layout/RouteLoadingOverlay";
import { trackPageView } from "./lib/googleAnalytics";

function TrafficTracker() {
  const location = useLocation()
  const lastPath = useRef('')

  useEffect(() => {
    const path = `${location.pathname}${location.search}`
    if (path === lastPath.current || location.pathname.startsWith('/admin')) return
    lastPath.current = path
    trackPageView(path)
  }, [location.pathname, location.search])

  return null
}

function Storefront() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categorySlug = "", productId = "" } = useParams();
  const isCatalogRoute = location.pathname === "/catalogo";
  const isHowToBuyRoute = location.pathname === "/como-comprar";
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [searchToken, setSearchToken] = useState(0);

  const clearSearch = useCallback(() => {
    setSearch("");
    setSubmittedSearch("");
  }, []);

  const openCategory = (category: string) => {
    navigate(`/coleccion/${encodeURIComponent(category)}`);
  };

  const runSearch = () => {
    setSubmittedSearch(search.trim());
    setSearchToken((current) => current + 1);
    navigate("/catalogo");
  };

  return (
    <div className={storeStyles}>
      <AnnouncementBar />
      <Header
        search={search}
        onSearchChange={setSearch}
        onSearch={runSearch}
        onCategoryNavigate={openCategory}
      />
      <main id="top">
        {isHowToBuyRoute ? (
          <HowToBuy />
        ) : productId ? (
          <ProductDetail productId={Number(productId)} />
        ) : categorySlug || isCatalogRoute ? (
          <Catalog
            search={search}
            submittedSearch={submittedSearch}
            searchToken={searchToken}
            onClearSearch={clearSearch}
            requestedCategory={{ name: categorySlug, token: 0 }}
          />
        ) : (
          <>
            <HeroCarousel />
            <EditorialCollections onCategoryNavigate={openCategory} />
            <FeaturedProducts />
            <BrandManifesto />
            <Benefits />
          </>
        )}
      </main>
      <CartDrawer />
      <WhatsAppFloat />
      <Footer />
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const esAdministrador = user?.rol === "admin" || user?.rol === "admin_operativo";
  const esAdminTotal = user?.rol === "admin";
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center">
        <p>Verificando sesión…</p>
      </div>
    );
  return <>
    <TrafficTracker />
    <RouteLoadingOverlay />
    <Routes>
      <Route path="/restablecer-clave" element={<ResetPassword />} />
      <Route
        path="/mi-cuenta"
        element={user ? <MyAccount /> : <Navigate to="/" replace />}
      />
      <Route
        path="/admin"
        element={
          esAdministrador ? <AdminLayout /> : <Navigate to="/" replace />
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="productos" element={<AdminProducts />} />
        <Route path="stock-talles" element={<AdminSizeStock />} />
        <Route path="analitica" element={esAdminTotal ? <AdminProductAnalytics /> : <Navigate to="/admin" replace />} />
        <Route path="trafico" element={esAdminTotal ? <AdminTrafficAnalytics /> : <Navigate to="/admin" replace />} />
        <Route path="pedidos" element={<AdminOrders />} />
        <Route path="confirmaciones" element={<AdminConfirmations />} />
        <Route path="notificaciones" element={<AdminNotifications />} />
        <Route path="clientes" element={<AdminClients />} />
        <Route
          path="migracion-wordpress"
          element={esAdminTotal ? <AdminWordpressMigration /> : <Navigate to="/admin" replace />}
        />
        <Route path="materiales" element={<AdminMaterials />} />
        <Route
          path="configuracion"
          element={esAdminTotal ? <AdminPlaceholder
              title="Configuración"
              description="Reglas comerciales, sincronización y preferencias de la tienda."
              icon="⚙"
            /> : <Navigate to="/admin" replace />}
        />
      </Route>
      <Route path="/" element={<Storefront />} />
      <Route path="/catalogo" element={<Storefront />} />
      <Route path="/como-comprar" element={<Storefront />} />
      <Route path="/coleccion/:categorySlug" element={<Storefront />} />
      <Route
        path="/producto/:productId/:productSlug?"
        element={<Storefront />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>;
}
