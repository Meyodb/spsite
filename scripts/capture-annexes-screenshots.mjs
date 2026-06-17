#!/usr/bin/env node
/** Captures d'écran pour les annexes du mémoire (site public + admin). */
import puppeteer from "puppeteer";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../docs/annexes/captures");
const BASE = process.env.CAPTURE_BASE_URL || "http://127.0.0.1:4000";
const ADMIN_USER = process.env.ADMIN_USER || "Soupandjuice";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "wU48wJ29";

const SITE_PAGES = [
  { file: "site-01-accueil.png", url: "/", fullPage: false },
  { file: "site-02-menu-produits.png", url: "/produits", fullPage: true },
  { file: "site-03-restaurants.png", url: "/restaurants", fullPage: true },
  { file: "site-04-allergenes.png", url: "/allergenes", fullPage: true },
];

async function acceptCookies(page) {
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      /accepter/i.test(b.textContent || "")
    );
    btn?.click();
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  for (const { file, url, fullPage } of SITE_PAGES) {
    await page.goto(`${BASE}${url}`, { waitUntil: "networkidle2", timeout: 60000 });
    await acceptCookies(page);
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(OUT, file),
      fullPage: !!fullPage,
    });
    console.log("✓", file);
  }

  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(OUT, "admin-01-login.png") });
  console.log("✓ admin-01-login.png");

  await page.type("#username", ADMIN_USER, { delay: 20 });
  await page.type("#password", ADMIN_PASS, { delay: 20 });
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 20000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(OUT, "admin-02-tableau-de-bord.png"),
    fullPage: true,
  });
  console.log("✓ admin-02-tableau-de-bord.png");

  await browser.close();
  console.log("Captures :", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
