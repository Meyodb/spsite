import { Link } from "react-router-dom";
import { PageSEO } from "../components/PageSEO";
import "./NotFound.css";

export const NotFound = () => {
  return (
    <main className="not-found-page">
      <PageSEO
        title="Page introuvable"
        description="La page que vous recherchez n'existe pas ou a été déplacée."
        noindex
      />
      <div className="not-found-container">
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Page introuvable</h1>
        <p className="not-found-text">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="not-found-btn not-found-btn--primary">
            Retour à l'accueil
          </Link>
          <Link to="/produits" className="not-found-btn not-found-btn--secondary">
            Voir la carte
          </Link>
        </div>
      </div>
    </main>
  );
};
