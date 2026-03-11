import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./App.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { CookieBanner } from "./components/CookieBanner";
import { COOKIE_CONSENT_UPDATED_EVENT } from "./cookies/consent";
import { applyOptionalServicesFromConsent } from "./cookies/optionalServices";
import { Home } from "./pages/Home";
import { ProduitsMenu } from "./pages/ProduitsMenu";
import { Contact } from "./pages/Contact";
import { Restaurants } from "./pages/Restaurants";
import { RestaurantDetail } from "./pages/RestaurantDetail";
import { FAQ } from "./pages/FAQ";

const ADN = lazy(() => import("./pages/ADN").then((m) => ({ default: m.ADN })));
const NosPiliers = lazy(() => import("./pages/NosPiliers").then((m) => ({ default: m.NosPiliers })));
const Allergenes = lazy(() => import("./pages/Allergenes").then((m) => ({ default: m.Allergenes })));
const Catering = lazy(() => import("./pages/Catering").then((m) => ({ default: m.Catering })));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales").then((m) => ({ default: m.MentionsLegales })));
const PolitiqueConfidentialite = lazy(() => import("./pages/PolitiqueConfidentialite").then((m) => ({ default: m.PolitiqueConfidentialite })));
const PolitiqueCookies = lazy(() => import("./pages/PolitiqueCookies").then((m) => ({ default: m.PolitiqueCookies })));
const CGU = lazy(() => import("./pages/CGU").then((m) => ({ default: m.CGU })));
const Formation = lazy(() => import("./pages/Formation").then((m) => ({ default: m.Formation })));
const FormationSection = lazy(() => import("./pages/FormationSection").then((m) => ({ default: m.FormationSection })));
const NotFound = lazy(() => import("./pages/NotFound").then((m) => ({ default: m.NotFound })));

function LoadingFallback() {
  const { t } = useTranslation();
  return <div style={{ padding: "2rem", textAlign: "center" }}>{t("common.loading")}</div>;
}

function LazyPage({ children }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

function AppContent() {
  const { pathname } = useLocation();
  const isHome = pathname === "/" || pathname === "";

  useEffect(() => {
    applyOptionalServicesFromConsent();

    const updateHandler = () => {
      applyOptionalServicesFromConsent();
    };

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, updateHandler);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, updateHandler);
    };
  }, []);

  return (
    <>
      <ScrollToTop />
      <div className={`sj-style ${isHome ? "page-is-home" : ""}`}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produits" element={<LazyPage><ProduitsMenu /></LazyPage>} />
          <Route path="/adn" element={<LazyPage><ADN /></LazyPage>} />
          <Route path="/nos-piliers" element={<LazyPage><NosPiliers /></LazyPage>} />
          <Route path="/catering" element={<LazyPage><Catering /></LazyPage>} />
          <Route path="/restaurants" element={<LazyPage><Restaurants /></LazyPage>} />
          <Route path="/restaurants/:slug" element={<LazyPage><RestaurantDetail /></LazyPage>} />
          <Route path="/contact" element={<LazyPage><Contact /></LazyPage>} />
          <Route path="/allergenes" element={<LazyPage><Allergenes /></LazyPage>} />
          <Route path="/faq" element={<LazyPage><FAQ /></LazyPage>} />
          <Route path="/mentions-legales" element={<LazyPage><MentionsLegales /></LazyPage>} />
          <Route path="/politique-confidentialite" element={<LazyPage><PolitiqueConfidentialite /></LazyPage>} />
          <Route path="/politique-cookies" element={<LazyPage><PolitiqueCookies /></LazyPage>} />
          <Route path="/cgu" element={<LazyPage><CGU /></LazyPage>} />
          <Route path="/formation" element={<LazyPage><Formation /></LazyPage>} />
          <Route path="/formation/:sectionId" element={<LazyPage><FormationSection /></LazyPage>} />
          <Route path="*" element={<LazyPage><NotFound /></LazyPage>} />
        </Routes>
        <Footer />
      </div>
      <CookieBanner />
    </>
  );
}

function App({ RouterComponent = BrowserRouter, routerProps = {} }) {
  return (
    <RouterComponent {...routerProps}>
      <AppContent />
    </RouterComponent>
  );
}

export default App;
