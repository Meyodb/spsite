import crypto from "crypto";

const SCRYPT_KEYLEN = 64;
const HASH_PREFIX = "scrypt";

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = crypto.scryptSync(String(password), salt, SCRYPT_KEYLEN);
  return `${HASH_PREFIX}$${salt}$${derived.toString("hex")}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash) return false;

  const [prefix, salt, expectedHex] = String(storedHash).split("$");
  if (prefix !== HASH_PREFIX || !salt || !expectedHex) return false;

  const expected = Buffer.from(expectedHex, "hex");
  if (expected.length !== SCRYPT_KEYLEN) return false;

  const actual = crypto.scryptSync(String(password), salt, SCRYPT_KEYLEN);
  return crypto.timingSafeEqual(expected, actual);
}

// Comparaison à temps constant pour l'identifiant, afin de ne pas révéler
// par le temps de réponse si le nom d'utilisateur existe.
export function safeEquals(a, b) {
  const bufA = Buffer.from(String(a ?? ""));
  const bufB = Buffer.from(String(b ?? ""));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
