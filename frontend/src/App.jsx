import { lazy, Suspense, useEffect } from "react";
import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./App.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { Home } from "./pages/Home";
import { ADN } from "./pages/ADN";
import { Produits } from "./pages/Produits";
import { ProduitsMenuTest } from "./pages/ProduitsMenuTest";
import { Contact } from "./pages/Contact";
import { Allergenes } from "./pages/Allergenes";

const Restaurants = lazy(() => import("./pages/Restaurants").then((m) => ({ default: m.Restaurants })));

function LoadingFallback() {
  const { t } = useTranslation();
  return <>{t("common.loading")}</>;
}
import { MentionsLegales } from "./pages/MentionsLegales";
import { PolitiqueConfidentialite } from "./pages/PolitiqueConfidentialite";
import { PolitiqueCookies } from "./pages/PolitiqueCookies";
import { CGU } from "./pages/CGU";
import { Formation } from "./pages/Formation";
import { FormationSection } from "./pages/FormationSection";

const SITE_URL = import.meta.env.VITE_SITE_URL || "";

function AppContent() {
  const { pathname } = useLocation();
  const isHome = pathname === "/" || pathname === "";

  useEffect(() => {
    if (!SITE_URL) return;
    const hashPath = pathname && pathname !== "/" ? `#${pathname}` : "";
    const canonical = `${SITE_URL.replace(/\/$/, "")}${hashPath}`;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    if (link.href !== canonical) link.href = canonical;
  }, [pathname]);

  return (
    <>
      <ScrollToTop />
      <div className={`cojean-style ${isHome ? "page-is-home" : ""}`}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produits" element={<Produits />} />
          <Route path="/produits-test" element={<ProduitsMenuTest />} />
          <Route path="/adn" element={<ADN />} />
          <Route path="/restaurants" element={<Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}><LoadingFallback /></div>}><Restaurants /></Suspense>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/allergenes" element={<Allergenes />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
          <Route path="/politique-cookies" element={<PolitiqueCookies />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/formation" element={<Formation />} />
          <Route path="/formation/:sectionId" element={<FormationSection />} />
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
