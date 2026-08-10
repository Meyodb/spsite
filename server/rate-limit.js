/**
 * Limiteur de requêtes en mémoire (même approche que le rate limiting du chatbot).
 * Suffisant pour un process unique ; à remplacer par un store partagé si le
 * serveur passe un jour en multi-instance.
 */
const buckets = new Map(); // clé → { hits: number[], blockedUntil: number }

export function createRateLimiter({
  windowMs,
  max,
  message = "Trop de requêtes, réessayez plus tard.",
  blockMs = 0,
  keyGenerator = (req) => req.ip,
  // Permet de répondre autrement qu'en JSON (redirection d'un formulaire HTML).
  onLimit = (req, res) => res.status(429).json({ success: false, message }),
}) {
  return function rateLimiter(req, res, next) {
    const key = keyGenerator(req);
    const now = Date.now();
    const bucket = buckets.get(key) || { hits: [], blockedUntil: 0 };

    if (bucket.blockedUntil > now) {
      res.setHeader("Retry-After", Math.ceil((bucket.blockedUntil - now) / 1000));
      return onLimit(req, res);
    }

    bucket.hits = bucket.hits.filter((t) => t > now - windowMs);

    if (bucket.hits.length >= max) {
      if (blockMs > 0) bucket.blockedUntil = now + blockMs;
      buckets.set(key, bucket);
      res.setHeader("Retry-After", Math.ceil((blockMs || windowMs) / 1000));
      return onLimit(req, res);
    }

    bucket.hits.push(now);
    buckets.set(key, bucket);
    return next();
  };
}

// Purge périodique pour éviter la croissance illimitée de la Map.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    const stale = bucket.hits.every((t) => t < now - 60 * 60 * 1000);
    if (stale && bucket.blockedUntil < now) buckets.delete(key);
  }
}, CLEANUP_INTERVAL_MS).unref();
