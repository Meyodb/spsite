/**
 * Génère le hash à coller dans ADMIN_PASSWORD_HASH (.env).
 *
 *   node server/scripts/set-admin-password.js "mon-mot-de-passe"
 *   node server/scripts/set-admin-password.js            # génère un mot de passe aléatoire
 */
import crypto from "crypto";
import { hashPassword } from "../auth.js";

const provided = process.argv[2];
const password = provided || crypto.randomBytes(18).toString("base64url");

if (!provided) {
  console.log(`Mot de passe généré : ${password}`);
  console.log("Conservez-le dans un gestionnaire de mots de passe, il ne sera plus affiché.\n");
}

console.log("À copier dans .env :");
console.log(`ADMIN_PASSWORD_HASH=${hashPassword(password)}`);
