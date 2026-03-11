import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./App.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { Home } from "./pages/Home";

const ADN = lazy(() => import("./pages/ADN").then((m) => ({ default: m.ADN })));
const NosPiliers = lazy(() => import("./pages/NosPiliers").then((m) => ({ default: m.NosPiliers })));
const ProduitsMenuTest = lazy(() => import("./pages/ProduitsMenuTest").then((m) => ({ default: m.ProduitsMenuTest })));
const Contact = lazy(() => import("./pages/Contact").then((m) => ({ default: m.Contact })));
const Allergenes = lazy(() => import("./pages/Allergenes").then((m) => ({ default: m.Allergenes })));
const Catering = lazy(() => import("./pages/Catering").then((m) => ({ default: m.Catering })));
const Restaurants = lazy(() => import("./pages/Restaurants").then((m) => ({ default: m.Restaurants })));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales").then((m) => ({ default: m.MentionsLegales })));
const PolitiqueConfidentialite = lazy(() => import("./pages/PolitiqueConfidentialite").then((m) => ({ default: m.PolitiqueConfidentialite })));
const PolitiqueCookies = lazy(() => import("./pages/PolitiqueCookies").then((m) => ({ default: m.PolitiqueCookies })));
const CGU = lazy(() => import("./pages/CGU").then((m) => ({ default: m.CGU })));
const FAQ = lazy(() => import("./pages/FAQ").then((m) => ({ default: m.FAQ })));
const Formation = lazy(() => import("./pages/Formation").then((m) => ({ default: m.Formation })));
const FormationSection = lazy(() => import("./pages/FormationSection").then((m) => ({ default: m.FormationSection })));

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

  return (
    <>
      <ScrollToTop />
      <div className={`sj-style ${isHome ? "page-is-home" : ""}`}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produits" element={<LazyPage><ProduitsMenuTest /></LazyPage>} />
          <Route path="/adn" element={<LazyPage><ADN /></LazyPage>} />
          <Route path="/nos-piliers" element={<LazyPage><NosPiliers /></LazyPage>} />
          <Route path="/catering" element={<LazyPage><Catering /></LazyPage>} />
          <Route path="/restaurants" element={<LazyPage><Restaurants /></LazyPage>} />
          <Route path="/contact" element={<LazyPage><Contact /></LazyPage>} />
          <Route path="/allergenes" element={<LazyPage><Allergenes /></LazyPage>} />
          <Route path="/faq" element={<LazyPage><FAQ /></LazyPage>} />
          <Route path="/mentions-legales" element={<LazyPage><MentionsLegales /></LazyPage>} />
          <Route path="/politique-confidentialite" element={<LazyPage><PolitiqueConfidentialite /></LazyPage>} />
          <Route path="/politique-cookies" element={<LazyPage><PolitiqueCookies /></LazyPage>} />
          <Route path="/cgu" element={<LazyPage><CGU /></LazyPage>} />
          <Route path="/formation" element={<LazyPage><Formation /></LazyPage>} />
          <Route path="/formation/:sectionId" element={<LazyPage><FormationSection /></LazyPage>} />
        </Routes>
        <Footer />
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
