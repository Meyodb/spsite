#!/usr/bin/env node
/**
 * Démarre le serveur puis expose le site via un tunnel (accès à distance).
 * Utilise Cloudflare Tunnel (sans mot de passe) si disponible, sinon localtunnel.
 * Usage: npm run start:tunnel
 */
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const serverDir = path.join(rootDir, "server");
const PORT = process.env.PORT || 4000;

const TUNNEL_PREFER = process.env.TUNNEL_PREFER || "cloudflare"; // "cloudflare" | "localtunnel"

console.log("Démarrage du serveur sur le port", PORT, "...\n");

const server = spawn("node", ["server.js"], {
  cwd: serverDir,
  stdio: "inherit",
  env: { ...process.env, PORT },
});

server.on("error", (err) => {
  console.error("Erreur serveur:", err);
  process.exit(1);
});

server.on("exit", (code) => {
  if (code !== 0 && code !== null) process.exit(code);
});

function startCloudflareTunnel() {
  console.log("\nOuverture du tunnel Cloudflare (aucun mot de passe requis)...\n");
  const tunnel = spawn(
    "npx",
    ["--yes", "cloudflared", "tunnel", "--url", `http://localhost:${PORT}`],
    { cwd: rootDir, stdio: "inherit" }
  );
  tunnel.on("error", (err) => {
    console.error("Erreur tunnel Cloudflare:", err.message);
    console.log("\n→ Utilisation du tunnel localtunnel à la place.\n");
    startLocaltunnel();
  });
  tunnel.on("exit", (code) => {
    if (code !== 0 && code !== null) server.kill();
  });
  return tunnel;
}

function startLocaltunnel() {
  console.log("Ouverture du tunnel localtunnel...\n");
  console.log("⚠️  Si une page demande un « Tunnel Password », localtunnel");
  console.log("   utilise l’IP du créateur du tunnel. Elle peut ne pas");
  console.log("   correspondre à votre IP actuelle (VPN, autre réseau).\n");
  console.log("   Conseil : installez cloudflared pour un accès sans mot de passe :");
  console.log("   npm i -g cloudflared   puis  cloudflared tunnel --url http://localhost:" + PORT + "\n");
  const tunnel = spawn("npx", ["localtunnel", "--port", String(PORT)], {
    cwd: rootDir,
    stdio: "inherit",
  });
  tunnel.on("error", (err) => {
    console.error("Erreur tunnel:", err.message);
  });
  tunnel.on("exit", (code) => {
    if (code !== 0 && code !== null) server.kill();
  });
}

// Attendre que le serveur soit prêt puis lancer le tunnel
setTimeout(() => {
  if (TUNNEL_PREFER === "cloudflare") {
    startCloudflareTunnel();
  } else {
    startLocaltunnel();
  }
}, 2000);

process.on("SIGINT", () => {
  server.kill();
  process.exit(0);
});
