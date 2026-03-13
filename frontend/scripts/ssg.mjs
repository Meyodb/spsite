import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist");
const ssrBundlePath = path.resolve(rootDir, "dist-ssr", "entry-server.js");

const routesToPrerender = [
  "/",
  "/produits",
  "/restaurants",
  "/faq",
  "/contact",
  "/adn",
  "/nos-piliers",
  "/catering",
  "/allergenes",
  "/mentions-legales",
  "/politique-confidentialite",
  "/politique-cookies",
  "/cgu",
  "/formation",
];

function normalizeRoute(route) {
  if (!route.startsWith("/")) return `/${route}`;
  return route;
}

function routeToOutputPath(route) {
  if (route === "/") return path.join(distDir, "index.html");
  return path.join(distDir, route.slice(1), "index.html");
}

function serializeHelmet(helmet) {
  if (!helmet) return "";
  return [
    helmet.title?.toString() ?? "",
    helmet.meta?.toString() ?? "",
    helmet.link?.toString() ?? "",
    helmet.script?.toString() ?? "",
  ]
    .filter(Boolean)
    .join("\n");
}

function extractHeadFragments(appHtml) {
  const patterns = [
    /<title>[\s\S]*?<\/title>/g,
    /<meta\b[^>]*>/g,
    /<link\b[^>]*>/g,
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
  ];

  const fragments = [];
  let cleanedHtml = appHtml;

  for (const pattern of patterns) {
    const matches = cleanedHtml.match(pattern);
    if (!matches) continue;
    fragments.push(...matches);
    cleanedHtml = cleanedHtml.replace(pattern, "");
  }

  return {
    cleanedHtml,
    headFragments: fragments.join("\n"),
  };
}

function injectApp(template, appHtml, helmetTags) {
  const { cleanedHtml, headFragments } = extractHeadFragments(appHtml);
  const withApp = template.replace(/<div id="root">[\s\S]*<\/div>/, `<div id="root">${cleanedHtml}</div>`);
  const combinedHead = [helmetTags, headFragments].filter(Boolean).join("\n");
  if (!combinedHead) return withApp;
  return withApp.replace("</head>", `\n${combinedHead}\n</head>`);
}

async function prerender() {
  const template = await readFile(path.join(distDir, "index.html"), "utf-8");
  const { render } = await import(pathToFileURL(ssrBundlePath).href);

  for (const route of routesToPrerender) {
    const normalizedRoute = normalizeRoute(route);
    const outputPath = routeToOutputPath(normalizedRoute);
    const { appHtml, helmet } = await render(normalizedRoute);
    const html = injectApp(template, appHtml, serializeHelmet(helmet));

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html, "utf-8");
  }

  await rm(path.resolve(rootDir, "dist-ssr"), { recursive: true, force: true });
}

prerender().catch((error) => {
  console.error("SSG generation failed:", error);
  process.exit(1);
});
