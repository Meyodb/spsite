import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Désactiver la restauration automatique du scroll par le navigateur
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    // Scroll en haut après le rendu (évite les conflits avec le layout)
    const id = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
};
