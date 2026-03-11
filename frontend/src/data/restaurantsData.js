export const RESTAURANTS = [
  { id: 1, name: "SOUP & JUICE ST LAZARE", address: "4 Rue de Londres, 75008 Paris", coordinates: [2.33046, 48.87678], hours: "Lundi - Vendredi: 9h00 - 15h00", phone: "+33 1 XX XX XX XX" },
  { id: 2, name: "SOUP & JUICE BOURSE", address: "135 Rue Montmartre, 75002 Paris", coordinates: [2.34470, 48.86575], hours: "Lundi - Vendredi: 9h00 - 15h00", phone: "+33 1 XX XX XX XX" },
  { id: 3, name: "SOUP & JUICE HAUSSMANN", address: "23 Rue Taitbout, 75009 Paris", coordinates: [2.33527, 48.87312], hours: "Lundi - Vendredi: 9h00 - 15h00", phone: "+33 1 XX XX XX XX" },
  { id: 4, name: "SOUP & JUICE ÉCURIES", address: "7 Rue des Petites Écuries, 75010 Paris", coordinates: [2.35344, 48.87306], hours: "Lundi - Vendredi: 9h00 - 15h00", phone: "+33 1 XX XX XX XX" },
  { id: 5, name: "SOUP & JUICE ÉTOILE", address: "54 Avenue Kléber, 75016 Paris", coordinates: [2.29115, 48.86880], hours: "Lundi - Vendredi: 9h00 - 15h00", phone: "+33 1 XX XX XX XX" },
  { id: 6, name: "SOUP & JUICE OPÉRA", address: "24 Rue du 4 septembre, 75002 Paris", coordinates: [2.33515, 48.86994], hours: "Lundi - Vendredi: 9h00 - 15h00", phone: "+33 1 XX XX XX XX" },
  { id: 7, name: "SOUP & JUICE NEUILLY", address: "38 Rue Ybry, 92200 Neuilly-sur-Seine", coordinates: [2.26032, 48.88753], hours: "Lundi - Vendredi: 9h00 - 15h00", phone: "06 37 79 03 01", deliverooUrl: "https://deliveroo.fr/fr/menu/paris/neuilly-sur-seine/soup-and-juice-neuilly" },
  { id: 8, name: "SOUP & JUICE HONORÉ", address: "38 Rue de Berri, 75008 Paris", coordinates: [2.30700, 48.87390], hours: "Lundi - Vendredi: 9h00 - 15h00", phone: "+33 1 XX XX XX XX" },
  { id: 9, name: "SOUP & JUICE MADELEINE", address: "24 Rue d'Anjou, 75008 Paris", coordinates: [2.32175, 48.87125], hours: "Lundi - Vendredi: 9h00 - 15h00", phone: "+33 1 XX XX XX XX" },
];

export const RESTAURANT_COUNT = RESTAURANTS.length;

export const RESTAURANT_NAMES_LIST = RESTAURANTS.map((r) =>
  r.name.replace("SOUP & JUICE ", "")
).join(", ");
