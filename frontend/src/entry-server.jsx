import { renderToString } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { StaticRouter } from "react-router";
import App from "./App.jsx";
import "./i18n";

export function render(url) {
  const helmetContext = {};
  const appHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <App RouterComponent={StaticRouter} routerProps={{ location: url }} />
    </HelmetProvider>,
  );

  return {
    appHtml,
    helmet: helmetContext.helmet,
  };
}
