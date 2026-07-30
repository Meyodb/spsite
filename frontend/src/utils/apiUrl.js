/**
 * Construit l'URL d'un endpoint de l'API.
 *
 * En production le frontend et l'API sont servis par la même origine, donc
 * une URL relative suffit. En développement, Vite proxifie /api et /videos
 * vers le backend. VITE_API_URL permet de forcer une origine distincte.
 */
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function apiUrl(path) {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
