import {
  Wheat,
  Fish,
  Egg,
  Milk,
  Nut,
  Bean,
  Wine,
  Flower,
  Shell,
  Carrot,
  CircleDot,
  Shrimp,
} from "lucide-react";

/** Couleurs associées à chaque allergène */
const ALLERGEN_COLORS = {
  gluten: { bg: "#F5E6C8", icon: "#B8860B" },        // blé / doré
  crustaces: { bg: "#FFE4D6", icon: "#E07B5B" },    // crevette / corail
  oeufs: { bg: "#FFF8E7", icon: "#D4A017" },        // œuf / jaune
  poissons: { bg: "#E3F2FD", icon: "#1976D2" },     // poisson / bleu mer
  arachides: { bg: "#EFE0D5", icon: "#8B5A2B" },    // cacahuète / marron
  soja: { bg: "#E8F5E9", icon: "#558B2F" },         // soja / vert
  lait: { bg: "#E3F2FD", icon: "#42A5F5" },         // lait / bleu clair
  fruitsacoque: { bg: "#EFEBE9", icon: "#6D4C41" }, // noix / marron
  celeri: { bg: "#E8F5E9", icon: "#43A047" },      // céleri / vert
  moutarde: { bg: "#FFF9C4", icon: "#F9A825" },     // moutarde / jaune
  sesame: { bg: "#FFF8E1", icon: "#C8A574" },       // sésame / beige
  sulfites: { bg: "#FCE4EC", icon: "#AD1457" },     // vin / bordeaux
  lupin: { bg: "#F3E5F5", icon: "#7B1FA2" },        // fleur / violet
  mollusques: { bg: "#FFF3E0", icon: "#E65100" },   // coquillage / orange
};

/** Labels des allergènes en majuscules (pour tooltip) */
const ALLERGEN_LABELS = {
  gluten: "GLUTEN",
  crustaces: "CRUSTACÉS",
  oeufs: "ŒUFS",
  poissons: "POISSONS",
  arachides: "ARACHIDES",
  soja: "SOJA",
  lait: "LAIT",
  fruitsacoque: "FRUITS À COQUE",
  celeri: "CÉLERI",
  moutarde: "MOUTARDE",
  sesame: "SÉSAME",
  sulfites: "SULFITES",
  lupin: "LUPIN",
  mollusques: "MOLLUSQUES",
};

/** Mapping allergène -> composant icône Lucide */
const ALLERGEN_ICONS = {
  gluten: Wheat,
  crustaces: Shrimp,
  oeufs: Egg,
  poissons: Fish,
  arachides: Bean,
  soja: Bean,
  lait: Milk,
  fruitsacoque: Nut,
  celeri: Carrot,
  moutarde: CircleDot,
  sesame: CircleDot,
  sulfites: Wine,
  lupin: Flower,
  mollusques: Shell,
};

export function AllergenPictograms({ allergens = [], size = 20, className = "" }) {
  if (!allergens || allergens.length === 0) return null;
  return (
    <div className={className} role="img" aria-label={`Allergènes : ${allergens.map((k) => ALLERGEN_LABELS[k] || k).join(", ")}`}>
      {allergens.map((key) => {
        const Icon = ALLERGEN_ICONS[key];
        const colors = ALLERGEN_COLORS[key] || { bg: "#f5f5f5", icon: "#666" };
        if (!Icon) return null;
        return (
          <span
            key={key}
            className="allergen-pictogram"
            style={{
              width: size,
              height: size,
              backgroundColor: colors.bg,
              color: colors.icon,
              borderRadius: "8px",
            }}
            title={ALLERGEN_LABELS[key] || key.toUpperCase()}
          >
            <Icon size={size - 4} strokeWidth={2} />
          </span>
        );
      })}
    </div>
  );
}
