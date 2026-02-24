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

/** Mapping produit (nom) -> allergènes */
export const ALLERGEN_BY_PRODUCT = {
  /* Plats chauds */
  "CABILLAUD TERIYAKI": ["gluten", "poissons", "soja", "sesame"],
  "POULET KORMA": ["oeufs", "soja", "lait"],
  "POULET QUINOA TANDOORI": ["soja", "lait"],
  "POULET TIKKA MASSALA": ["gluten", "oeufs", "soja", "lait", "fruitsacoque"],
  "LASAGNE BOLOGNESE": ["gluten", "lait", "fruitsacoque"],
  "POULET BOMBAY": ["oeufs", "soja", "lait", "celeri", "moutarde"],
  "POULET CURRY": ["oeufs", "soja"],
  "ROUGAIL THON": ["poissons"],
  "SAUMON SAUCE CITRON GINGEMBRE": ["poissons", "lait", "fruitsacoque"],
  "LASAGNE VEGAN": ["gluten", "soja", "fruitsacoque"],
  "DUO DE RIZ AUBERGINES FALAFEL": ["gluten", "moutarde", "sulfites"],
  "FAGOTTINI": ["gluten", "oeufs", "lait"],
  "PÂTES AU PESTO": ["gluten", "lait", "fruitsacoque"],
  "QUICHE LORRAINE": ["gluten", "oeufs", "lait", "fruitsacoque"],
  "QUICHE 3 FROMAGES": ["gluten", "oeufs", "lait"],
  "QUICHE RICOTTA TOMATO CERISE": ["gluten", "oeufs", "lait"],
  "TARTE SAUMON ÉPINARDS": ["gluten", "oeufs", "poissons", "lait", "fruitsacoque"],
  "TARTE CHÈVRE ÉPINARDS": ["gluten", "oeufs", "lait", "fruitsacoque", "sesame"],
  "POULET TIKKA": ["gluten", "oeufs", "soja", "lait", "fruitsacoque"],
  "TIKKA VÉGÉTARIEN": ["gluten", "soja", "lait"],
  "COUSCOUS POULET": ["gluten"],
  "TORTELLINI PESTO ROUGE": ["gluten", "lait", "fruitsacoque"],
  "QUICHE CHÈVRE ÉPINARDS": ["gluten", "oeufs", "lait", "fruitsacoque", "sesame"],
  "QUICHE PATATE DOUCE FETA": ["gluten", "oeufs", "lait"],
  "SOUPE JAPONAISE": ["gluten", "soja", "poissons"],
  /* Salades */
  "SALADE POWERFUL": ["gluten", "lait", "soja", "fruitsacoque"],
  "GRANDE BUDDHA BOWL": ["gluten", "lait"],
  "SALADE RISONI PESTO": ["gluten", "lait"],
  "SALADE CHOUX ROUGE": ["gluten", "lait", "fruitsacoque", "sesame"],
  "SALADE DE BETTERAVES": ["lait", "sesame"],
  "SALADE ÉPEAUTRE": ["gluten", "lait"],
  "SALADE LENTILLE ŒUF POCHÉ": ["oeufs", "moutarde"],
  "GRANDE SALADE LENTILLE ŒUF POCHÉ": ["oeufs", "lait", "moutarde"],
  "SALADE RISONI": ["gluten", "lait"],
  "SALADE SAUMON GRAVLAX": ["gluten", "poissons", "celeri", "moutarde", "sulfites"],
  "SALADE LENTILLE SAUMON": ["moutarde"],
  "SALADE POULET CAJUN & MANGUE": ["gluten", "soja", "lait", "moutarde"],
  "SALADE BOLLYWOOD": ["gluten", "soja", "lait", "sulfites"],
  "QUINOA & ÉCREVISSES": ["crustaces"],
  "QUINOA & HALLOUMI": ["gluten", "lait"],
  "RIZ NOIR & ÉCREVISSES": ["crustaces"],
  "SALADE RIZ NOIR PATATE DOUCE BACON": ["lait"],
  "SALADE RIZ NOIR TAPENADE DE THON": ["poissons", "celeri", "oeufs", "moutarde", "lait"],
  "SALADE LOW CARB": ["moutarde", "oeufs", "lait", "fruitsacoque"],
  "SALADE SUSHI": ["oeufs", "poissons", "soja", "moutarde", "sesame"],
  /* Sandwichs */
  "WRAP CAJUN": ["gluten"],
  "WRAP CHAUD MEXICAIN": ["gluten", "lait"],
  "WRAP CHAUD HOUMOUS FALAFEL": ["gluten", "sesame"],
  "WRAP POULET RAS EL HANOUT": ["gluten"],
  "BAGEL NEW YORK": ["gluten", "lait", "sesame"],
  "BAGEL CHÈVRE": ["gluten", "lait"],
  "WRAP RAS EL HANOUT": ["gluten", "lait", "sesame"],
  "WRAP MEXICAIN": ["gluten", "lait"],
  "WRAP FETA (VÉGÉTARIEN)": ["gluten", "lait"],
  "WRAP FALAFEL (VÉGÉTALIEN)": ["gluten", "sesame"],
  "WRAP THON": ["gluten", "oeufs", "poissons", "lait", "celeri", "moutarde"],
  "WRAP SAUMON": ["gluten", "oeufs", "poissons", "moutarde"],
  "BAGEL SAUMON": ["gluten", "lait", "sesame"],
  "BAGEL HOLLAND STYLE": ["gluten", "lait", "sesame"],
  "BAGEL MOZZARELLA": ["gluten", "lait", "sesame"],
  "BAGEL PASTRAMI": ["gluten", "oeufs", "lait", "moutarde", "sesame"],
  "BAGEL DINDE & CHEDDAR": ["gluten", "lait", "moutarde", "sesame"],
  "BATBOUT THON": ["gluten", "poissons"],
  /* Soupes du listing allergènes */
  "CAROTTE COURGETTE PANAIS": ["gluten", "soja", "celeri"],
  "ASPERGES": ["gluten", "soja", "celeri"],
  "CHAMPIGNONS": ["gluten", "soja", "celeri"],
  "CHAMPIGNONS MIEL": ["gluten", "soja", "sulfites", "celeri"],
  "BROCOLIS AU BLEU": ["gluten", "soja", "lait", "celeri"],
  "CAPONATA": ["gluten", "soja", "celeri"],
  "CÉLERI POMMES NOISETTES": ["gluten", "soja", "celeri", "fruitsacoque"],
  "CAROTTES POMMES ET CURRY": ["gluten", "soja"],
  "CAROTTE ORANGE": ["gluten", "soja"],
  "CAROTTE PAVOT": ["gluten", "soja", "celeri"],
  "CHAMPIGNONS FAÇON RISOTTO": ["celeri"],
  "COCO BLANCS À LA TOMATE": ["gluten", "soja", "celeri"],
  "COURGETTES GINGEMBRE": ["gluten", "soja", "lait", "celeri"],
  "PATATE DOUCE AU LAIT DE COCO": ["celeri", "lait"],
  "ÉPINARD FETA": ["gluten", "soja", "lait", "celeri"],
  "ESPAGNOLE À LA CORIANDRE": ["celeri"],
  "TOMATE ET FENOUIL": ["gluten", "soja", "celeri"],
  "GASPACHO DE BROCOLIS": ["gluten", "soja", "lait", "celeri"],
  "GASPACHO DE CAROTTES": [],
  "GASPACHO DE TOMATES": [],
  "HARICOTS VERTS": ["gluten", "soja", "celeri"],
  "LENTILLES CORAIL AU LAIT DE COCO": ["lait"],
  "LENTILLES À L'INDIENNE": ["gluten", "soja"],
  "MAÏS AU POIVRON": ["celeri"],
  "MÉDITERRANÉENNE": ["celeri"],
  "HARICOT ROUGE À LA MEXICAINE": [],
  "MIX LÉGUMES À LA CORIANDRE": ["celeri"],
  "PETITS POIS ET CAROTTES": ["gluten", "soja", "celeri"],
  "PETITS POIS MENTHE": ["gluten", "soja", "celeri"],
  "MULLIGATOWNY": ["lait", "moutarde", "arachides", "fruitsacoque"],
  "POIREAUX PDT À L'ESTRAGON": ["gluten", "soja", "celeri"],
  "POIS CASSÉS": ["gluten", "soja", "celeri"],
  "POTIMARRON": ["celeri"],
  "POTIMARRON AU LAIT DE COCO": ["lait"],
  "TOMATE AU BASILIC": [],
  "VICHYSSOISE": ["gluten", "soja", "celeri"],
  "VELOUTÉ D'OSEILLE": ["gluten", "soja", "lait", "celeri"],
  "BUTTERNUT FENOUIL": [],
  "PANAIS AU MIEL": [],
  "POIRE ET BROCOLIS": [],
  "PANAIS": ["gluten", "soja"],
};

/** Retourne les allergènes pour un produit (par nom) */
export function getAllergensForProduct(productName) {
  return ALLERGEN_BY_PRODUCT[productName] || [];
}

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
