import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "").replace(/\/$/, "");
const SITE_NAME = "S&J";
const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`;
const SUPPORTED_LANGUAGES = ["fr", "en"];

const OG_LOCALES = { fr: "fr_FR", en: "en_GB" };

export const PageSEO = ({
  title,
  description,
  path = "",
  image,
  type = "website",
  noindex = false,
  jsonLd,
}) => {
  const { i18n } = useTranslation();
  const language = SUPPORTED_LANGUAGES.includes((i18n.language || "").split("-")[0])
    ? i18n.language.split("-")[0]
    : "fr";

  const canonical = `${SITE_URL}${path}`;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Soupes et jus frais depuis 2001`;
  const ogImage = image || DEFAULT_IMAGE;

  return (
    <Helmet htmlAttributes={{ lang: language }}>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Le site sert le même contenu aux deux langues (bascule côté client),
          les alternates pointent donc vers la même URL canonique. */}
      {!noindex &&
        SUPPORTED_LANGUAGES.map((lang) => (
          <link key={lang} rel="alternate" hrefLang={lang} href={canonical} />
        ))}
      {!noindex && <link rel="alternate" hrefLang="x-default" href={canonical} />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={OG_LOCALES[language]} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};
