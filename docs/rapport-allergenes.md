# Rapport : Fiche allergènes vs Produits du menu

## Produits du menu SANS fiche allergène

### Soupes (4 produits)
| Produit | ID |
|---------|-----|
| PATATE DOUCE AU LAIT DE COCO | 72 |
| CAROTTE PAVOT | 73 |
| PETITS POIS MENTHE | 71 |
| LENTILLES À L'INDIENNE | 74 |

### Plats chauds (5 produits)
| Produit | ID |
|---------|-----|
| POULET TIKKA | 26 |
| TIKKA VÉGÉTARIEN | 43 |
| COUSCOUS POULET | 27 |
| TORTELLINI PESTO ROUGE | 42 |
| SOUPE JAPONAISE | 94 |

### Quiches & tartes (2 produits)
| Produit | ID |
|---------|-----|
| QUICHE CHÈVRE ÉPINARDS | 28 |
| QUICHE PATATE DOUCE FETA | 39 |

### Salades (6 produits)
| Produit | ID |
|---------|-----|
| SALADE POWERFUL | 32 |
| GRANDE BUDDHA BOWL | 31 |
| SALADE RISONI PESTO | 29 |
| SALADE CHOUX ROUGE | 30 |
| GRANDE SALADE LENTILLE ŒUF POCHÉ | 98 |
| SALADE RISONI | 99 |

### Wraps & bagels (8 produits)
| Produit | ID |
|---------|-----|
| WRAP CAJUN | 33 |
| WRAP CHAUD MEXICAIN | 34 |
| WRAP CHAUD HOUMOUS FALAFEL | 35 |
| WRAP POULET RAS EL HANOUT | 36 |
| BAGEL NEW YORK | 37 |
| BAGEL CHÈVRE | 38 |
| WRAP RAS EL HANOUT | 109 |
| WRAP MEXICAIN | 110 |

### Desserts (15 produits)
| Produit | ID |
|---------|-----|
| COOKIES AU CHOCOLAT | 44 |
| FROMAGE BLANC | 45 |
| MOUSSE AU CHOCOLAT | 47 |
| TIRAMISU | 48 |
| MI CUIT FONDANT | 49 |
| BROWNIE | 50 |
| CRUMBLE POMME SPECULOOS | 51 |
| GRAINES DE CHIA FRAMBOISE | 53 |
| MOUSSE DE SKYR FRUITS ROUGES | 66 |
| SALADE FRUIT | 65 |
| CHEESECAKE FRUITS ROUGES | 69 |
| TARTE CITRON MERINGUÉE | 70 |
| PERLES CHIA FRAMBOISE | 123 |
| PERLES CHIA MANGUE PASSION | 124 |
| TARTALETTE NOIX DE PÉCAN | 126 |

---

## Différences de nommage (fiche vs menu)

| Fiche allergènes | Menu (productsData) | Statut |
|------------------|---------------------|--------|
| PERLES CHIA COCO FRAMBOISE | PERLES CHIA FRAMBOISE | Nom légèrement différent |
| PERLES CHIA COCO MANGUE PASSION | PERLES CHIA MANGUE PASSION | Nom légèrement différent |
| CAKE MARBRE CHOCOLAT | CAKE MARBRÉ CHOCOLAT | Accent différent |
| TARTE CHEVRE EPINARDS | TARTE CHÈVRE ÉPINARDS | Accents |
| SALADE RIZ NOIR, PATATE DOUCE, BACON | SALADE RIZ NOIR PATATE DOUCE BACON | Virgules vs espaces |
| DUO DE RIZ, AUBERGINES, FALAFEL | DUO DE RIZ AUBERGINES FALAFEL | Virgules vs espaces |
| PATE AU PESTO | PÂTES AU PESTO | Singulier vs pluriel |
| CITRON MERINGUE | TARTE CITRON MERINGUÉE | Nom différent |

---

## Résumé

- **Total produits alimentaires au menu** : ~80 (hors jus, boosters, milkshakes, boissons)
- **Produits dans la fiche allergènes** : 58
- **Produits manquants dans la fiche** : **40 produits**
- **Produits dans la fiche mais pas au menu** : 0 (tous les produits de la fiche correspondent à des produits du menu)

---

## Recommandation

La fiche allergènes n'est **pas à jour** avec l'ensemble des produits du menu. Il manque **40 produits** répartis comme suit :
- 4 soupes
- 5 plats chauds
- 2 quiches
- 6 salades
- 8 wraps/bagels
- 15 desserts

Pour mettre à jour la fiche, il faudrait ajouter les données allergènes (ou indiquer "aucun allergène majeur connu") pour chacun de ces produits dans `Allergenes.jsx` (DOC_ROWS).
