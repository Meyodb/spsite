import { prerenderToNodeStream } from "react-dom/static";
import { HelmetProvider } from "react-helmet-async";
import { StaticRouter } from "react-router";
import App from "./App.jsx";
import "./i18n";

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    // setEncoding gère le découpage des caractères multi-octets entre chunks.
    stream.setEncoding("utf-8");
    let html = "";
    stream.on("data", (chunk) => {
      html += chunk;
    });
    stream.on("error", reject);
    stream.on("end", () => resolve(html));
  });
}

/**
 * prerenderToNodeStream attend la résolution de toutes les frontières Suspense,
 * contrairement à renderToString qui se contenterait du fallback de
 * chargement : sans cela, les pages chargées en lazy() étaient prérendues
 * vides, sans contenu ni balises SEO.
 */
export async function render(url) {
  const helmetContext = {};

  const { prelude } = await prerenderToNodeStream(
    <HelmetProvider context={helmetContext}>
      <App RouterComponent={StaticRouter} routerProps={{ location: url }} />
    </HelmetProvider>,
    {
      onError(error) {
        console.error(`Erreur de prérendu sur ${url}:`, error);
      },
    },
  );

  const appHtml = await streamToString(prelude);

  return {
    appHtml,
    helmet: helmetContext.helmet,
  };
}
