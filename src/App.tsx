import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { CartDrawer } from "./components/cart/CartDrawer";
import { Benefits } from "./components/home/Benefits";
import { CustomerTestimonials } from "./components/home/CustomerTestimonials";
import { HeroCarousel } from "./components/home/HeroCarousel";
import { EditorialCollections } from "./components/home/EditorialCollections";
import { FeaturedProducts } from "./components/home/FeaturedProducts";
import { BrandManifesto } from "./components/home/BrandManifesto";
import { AnnouncementBar } from "./components/layout/AnnouncementBar";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { WhatsAppFloat } from "./components/layout/WhatsAppFloat";
import { storeStyles } from "./styles/tailwind";
import { RouteLoadingOverlay } from "./components/layout/RouteLoadingOverlay";
import { trackPageView } from "./lib/googleAnalytics";

// Las pantallas que no pertenecen al inicio se descargan sólo cuando el
// visitante entra en ellas. En especial, el panel admin deja de formar parte
// del bundle público que recibe cada visita a la tienda.
const Catalog = lazy(() => import("./components/catalog/Catalog").then((module) => ({ default: module.Catalog })));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then((module) => ({ default: module.AdminLayout })));
const MyAccount = lazy(() => import("./pages/MyAccount").then((module) => ({ default: module.MyAccount })));
const ProductDetail = lazy(() => import("./pages/ProductDetail").then((module) => ({ default: module.ProductDetail })));
const HowToBuy = lazy(() => import("./pages/HowToBuy").then((module) => ({ default: module.HowToBuy })));
const ResetPassword = lazy(() => import("./pages/ResetPassword").then((module) => ({ default: module.ResetPassword })));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").then((module) => ({ default: module.AdminDashboard })));
const AdminPlaceholder = lazy(() => import("./pages/admin/AdminPlaceholder").then((module) => ({ default: module.AdminPlaceholder })));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts").then((module) => ({ default: module.AdminProducts })));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders").then((module) => ({ default: module.AdminOrders })));
const AdminProductAnalytics = lazy(() => import("./pages/admin/AdminProductAnalytics").then((module) => ({ default: module.AdminProductAnalytics })));
const AdminTrafficAnalytics = lazy(() => import("./pages/admin/AdminTrafficAnalytics").then((module) => ({ default: module.AdminTrafficAnalytics })));
const AdminConfirmations = lazy(() => import("./pages/admin/AdminConfirmations").then((module) => ({ default: module.AdminConfirmations })));
const AdminClients = lazy(() => import("./pages/admin/AdminClients").then((module) => ({ default: module.AdminClients })));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications").then((module) => ({ default: module.AdminNotifications })));
const AdminSizeStock = lazy(() => import("./pages/admin/AdminSizeStock").then((module) => ({ default: module.AdminSizeStock })));
const AdminMaterials = lazy(() => import("./pages/admin/AdminMaterials").then((module) => ({ default: module.AdminMaterials })));
const AdminWordpressMigration = lazy(() => import("./pages/admin/AdminWordpressMigration").then((module) => ({ default: module.AdminWordpressMigration })));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews").then((module) => ({ default: module.AdminReviews })));

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
            <CustomerTestimonials />
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
  const esAdministrador = user?.rol === "admin_tecnico" || user?.rol === "admin" || user?.rol === "admin_operativo";
  const puedeVerAnalitica = user?.rol === "admin_tecnico" || user?.rol === "admin";
  const esAdminTecnico = user?.rol === "admin_tecnico";
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center">
        <p>Verificando sesión…</p>
      </div>
    );
  return <>
    <TrafficTracker />
    <RouteLoadingOverlay />
    <Suspense fallback={<div className="grid min-h-60 place-items-center"><p>Cargando…</p></div>}>
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
        <Route path="stock-talles" element={esAdminTecnico ? <AdminSizeStock /> : <Navigate to="/admin" replace />} />
        <Route path="analitica" element={puedeVerAnalitica ? <AdminProductAnalytics /> : <Navigate to="/admin" replace />} />
        <Route path="trafico" element={puedeVerAnalitica ? <AdminTrafficAnalytics /> : <Navigate to="/admin" replace />} />
        <Route path="pedidos" element={<AdminOrders />} />
        <Route path="confirmaciones" element={<AdminConfirmations />} />
        <Route path="notificaciones" element={<AdminNotifications />} />
        <Route path="opiniones" element={<AdminReviews />} />
        <Route path="clientes" element={<AdminClients />} />
        <Route
          path="migracion-wordpress"
          element={esAdminTecnico ? <AdminWordpressMigration /> : <Navigate to="/admin" replace />}
        />
        <Route path="materiales" element={<AdminMaterials />} />
        <Route
          path="configuracion"
          element={esAdminTecnico ? <AdminPlaceholder
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
    </Suspense>
  </>;
}
